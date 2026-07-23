import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChromeStorageService } from '../common/services/storage/ChromeStorageService';
import { StorageService } from '../common/services/storage/StorageService';
import {
  EntryCategory,
  EntryType,
  type CreateEntryPayload,
  type Entry,
  type FolderEntry,
  type LinkDataHook,
  type ModalState,
  type UpdateEntryPayload,
} from '../common/types/linkData.type';

// const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const DEFAULT_ROOT_DATA: Record<string, Entry> = {
  root: {
    id: 'root',
    name: 'Root',
    type: EntryType.FOLDER,
    parentId: null,
    children: [],
  },
};

const defaultStorageService = new ChromeStorageService<Record<string, Entry>>();

const createUniqueId = (entries: Record<string, Entry>) => {
  let id = globalThis.crypto.randomUUID();
  while (entries[id]) {
    id = globalThis.crypto.randomUUID();
  }
  return id;
};

export function useLinkData(
  storageService: StorageService<Record<string, Entry>> = defaultStorageService,
): LinkDataHook {
  const [currentOpenedLink, setCurrentOpenedLink] = useState<string | undefined>(undefined);
  const [allLinkData, setAllLinkData] = useState<Record<string, Entry>>(DEFAULT_ROOT_DATA);
  const [isMutating, setIsMutating] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const pendingPersistions = useRef(0);

  const storage = useMemo(() => storageService, [storageService]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const persistedData = await storage.getData();
      if (!active) {
        return;
      }

      if (persistedData && Object.keys(persistedData).length > 0) {
        setAllLinkData(persistedData);
      } else {
        await storage.setData(DEFAULT_ROOT_DATA);
        setAllLinkData(DEFAULT_ROOT_DATA);
      }

      setIsHydrated(true);
    };

    void initialize();

    return () => {
      active = false;
    };
  }, [storage]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    pendingPersistions.current += 1;
    setIsMutating(true);

    const persist = async () => {
      try {
        await storage.setData(allLinkData);
      } finally {
        pendingPersistions.current -= 1;
        if (pendingPersistions.current <= 0) {
          setIsMutating(false);
        }
      }
    };

    void persist();
  }, [allLinkData, isHydrated, storage]);

  const setInitialOpenedLink = useCallback((pathId: string) => {
    setCurrentOpenedLink(pathId);
  }, []);

  const getById = useCallback(
    (id: string): Entry => {
      return allLinkData[id];
    },
    [allLinkData],
  );

  const openCreateModal = useCallback((parentId: string | null) => {
    setModalState({
      isOpen: true,
      mode: 'create',
      parentId,
      entryType: EntryType.FOLDER,
    });
  }, []);

  const openEditModal = useCallback(
    (entryId: string) => {
      const entry = allLinkData[entryId];
      if (!entry) {
        return;
      }

      setModalState({
        isOpen: true,
        mode: 'edit',
        entryId,
        parentId: entry.parentId,
        entryType: entry.type,
      });
    },
    [allLinkData],
  );

  const openDeleteModal = useCallback(
    (entryId: string) => {
      const entry = allLinkData[entryId];
      if (!entry) {
        return;
      }

      setModalState({
        isOpen: true,
        mode: 'delete',
        entryId,
        parentId: entry.parentId,
        entryType: entry.type,
      });
    },
    [allLinkData],
  );

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const deleteEntry = useCallback(
    async (entryId: string) => {
      setIsMutating(() => true);
      try {
        // await delay(250);
        setAllLinkData((prevEntries) => {
          const entries = { ...prevEntries };
          const queue = [entryId];
          const deletedIds = new Set<string>();

          while (queue.length) {
            const currentId = queue.shift()!;
            const currentEntry = entries[currentId];
            if (!currentEntry || deletedIds.has(currentId)) {
              continue;
            }
            deletedIds.add(currentId);

            if (currentEntry.type === EntryType.FOLDER) {
              queue.push(...currentEntry.children);
            }

            delete entries[currentId];
          }

          const parentId = prevEntries[entryId]?.parentId;
          if (parentId) {
            const parentEntry = entries[parentId];
            if (parentEntry?.type === EntryType.FOLDER) {
              entries[parentId] = {
                ...parentEntry,
                children: parentEntry.children.filter((childId) => !deletedIds.has(childId)),
              } as FolderEntry;
            }
          }

          return entries;
        });

        if (currentOpenedLink && currentOpenedLink === entryId) {
          setCurrentOpenedLink('root');
        }
        closeModal();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    },
    [closeModal, currentOpenedLink],
  );

  const createEntry = useCallback(
    async (payload: CreateEntryPayload) => {
      setIsMutating(true);
      try {
        // await delay(250);
        setAllLinkData((prevEntries) => {
          const resolvedParentId = payload.parentId ?? 'root';
          const newId = createUniqueId(prevEntries);
          const newEntry: Entry =
            payload.type === EntryType.FOLDER
              ? {
                  id: newId,
                  name: payload.name,
                  type: EntryType.FOLDER,
                  parentId: resolvedParentId,
                  children: [],
                }
              : {
                  id: newId,
                  name: payload.name,
                  type: EntryType.URL,
                  parentId: resolvedParentId,
                  url: payload.url ?? '',
                  description: payload.description ?? '',
                };

          const nextEntries: Record<string, Entry> = { ...prevEntries, [newId]: newEntry };
          const parentEntry = nextEntries[resolvedParentId];

          if (parentEntry?.type === EntryType.FOLDER) {
            nextEntries[resolvedParentId] = {
              ...parentEntry,
              children: [...(parentEntry as FolderEntry).children, newId],
            } as FolderEntry;
          }

          return nextEntries;
        });

        closeModal();
      } catch (error) {
        console.error('Error creating entry:', error);
      }
    },
    [closeModal],
  );

  const updateEntry = useCallback(
    async (payload: UpdateEntryPayload) => {
      setIsMutating(true);
      try {
        // await delay(250);

        setAllLinkData((prevEntries) => {
          const entry = prevEntries[payload.entryId];
          if (!entry) {
            return prevEntries;
          }

          const updatedEntry =
            entry.type === EntryType.FOLDER
              ? { ...entry, name: payload.name }
              : {
                  ...entry,
                  name: payload.name,
                  url: payload.url ?? entry.url,
                  description: payload.description ?? entry.description,
                };

          return {
            ...prevEntries,
            [payload.entryId]: updatedEntry,
          };
        });

        closeModal();
      } catch (error) {
        console.error('Error updating entry:', error);
      }
    },
    [closeModal],
  );

  const searchEntries = useCallback(
    (startFolderId: string, query: string, category: EntryCategory) => {
      const rootEntry = allLinkData[startFolderId];
      if (!rootEntry || rootEntry.type !== EntryType.FOLDER) {
        return [];
      }

      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        return [];
      }

      const results: Entry[] = [];
      const queue: string[] = [...rootEntry.children];
      const searchType = category === EntryCategory.URL ? EntryType.URL : EntryType.FOLDER;
      while (queue.length) {
        const entryId = queue.shift()!;
        const entry = allLinkData[entryId];
        if (!entry) {
          continue;
        }

        if (entry.type === EntryType.FOLDER) {
          queue.push(...entry.children);
        }

        const haystack = [entry.name, entry.type === EntryType.URL ? entry.url : '']
          .join(' ')
          .toLowerCase();

        if (entry.type === searchType && haystack.includes(normalizedQuery)) {
          results.push(entry);
        }
      }
      return results;
    },
    [allLinkData],
  );

  return {
    allLinkData,
    getById,
    currentOpenedLink,
    isMutating,
    modalState,
    setInitialOpenedLink,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  };
}
