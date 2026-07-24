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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeImportedData = (raw: unknown): Record<string, Entry> => {
  if (!isRecord(raw)) {
    throw new Error('Imported JSON must be an object.');
  }

  const entries: Record<string, Entry> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!isRecord(value)) {
      throw new Error(`Entry ${key} must be an object.`);
    }

    const id = typeof value.id === 'string' ? value.id : key;
    if (!id) {
      throw new Error(`Entry ${key} must include a valid string id.`);
    }

    const name = typeof value.name === 'string' ? value.name.trim() : '';
    if (!name) {
      throw new Error(`Entry ${key} must include a valid name.`);
    }

    const type = value.type;
    if (type !== EntryType.FOLDER && type !== EntryType.URL) {
      throw new Error(`Entry ${key} has invalid type.`);
    }

    const parentId =
      typeof value.parentId === 'string' || value.parentId === null ? value.parentId : null;

    if (type === EntryType.FOLDER) {
      const children = Array.isArray(value.children)
        ? value.children.map((child) => {
            if (typeof child !== 'string') {
              throw new Error(`Folder ${id} has invalid child id.`);
            }
            return child;
          })
        : [];

      entries[id] = {
        id,
        name,
        type: EntryType.FOLDER,
        parentId,
        children,
      };
      continue;
    }

    if (typeof value.url !== 'string' || typeof value.description !== 'string') {
      throw new Error(`URL entry ${id} must include url and description strings.`);
    }

    entries[id] = {
      id,
      name,
      type: EntryType.URL,
      parentId,
      url: value.url,
      description: value.description,
    };
  }

  return entries;
};

const remapImportedEntries = (
  existingEntries: Record<string, Entry>,
  importedEntries: Record<string, Entry>,
): Record<string, Entry> => {
  const nextEntries = { ...existingEntries };
  const idMap = new Map<string, string>();

  const existingIds = new Set(Object.keys(existingEntries));

  for (const importId of Object.keys(importedEntries)) {
    const targetId = existingIds.has(importId) ? createUniqueId(nextEntries) : importId;
    idMap.set(importId, targetId);
  }

  for (const [importId, entry] of Object.entries(importedEntries)) {
    if (importId === 'root') {
      continue;
    }

    const targetId = idMap.get(importId)!;
    const remappedParentId =
      entry.parentId === null
        ? null
        : (idMap.get(entry.parentId) ??
          (existingIds.has(entry.parentId) ? entry.parentId : 'root'));

    if (entry.type === EntryType.FOLDER) {
      const remappedChildren = entry.children
        .map((childId) => idMap.get(childId) ?? childId)
        .filter((childId) => childId !== targetId);

      nextEntries[targetId] = {
        ...entry,
        id: targetId,
        parentId: remappedParentId,
        children: remappedChildren,
      };
      continue;
    }

    nextEntries[targetId] = {
      ...entry,
      id: targetId,
      parentId: remappedParentId,
    };
  }

  const rootEntry = nextEntries['root'] as FolderEntry;
  if (rootEntry && rootEntry.type === EntryType.FOLDER) {
    const rootChildren = new Set(rootEntry.children);
    for (const entry of Object.values(nextEntries)) {
      if (entry.id !== 'root' && entry.parentId === 'root') {
        rootChildren.add(entry.id);
      }
    }
    rootEntry.children = Array.from(rootChildren);
    nextEntries['root'] = rootEntry;
  }

  return nextEntries;
};

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

  const exportData = useCallback(() => {
    const json = JSON.stringify(allLinkData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `link-hub-data-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [allLinkData]);

  const importData = useCallback(
    async (rawData: unknown) => {
      setIsMutating(true);
      try {
        const importedEntries = normalizeImportedData(rawData);
        const mergedEntries = remapImportedEntries(allLinkData, importedEntries);
        setAllLinkData(mergedEntries);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to import data.';
        window.alert(`Import failed: ${message}`);
        throw error;
      }
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
    exportData,
    importData,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  };
}
