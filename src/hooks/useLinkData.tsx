import { useState } from 'react';
import {
  EntryType,
  type CreateEntryPayload,
  type Entry,
  type FolderEntry,
  type LinkDataHook,
  type ModalState,
  type UpdateEntryPayload,
} from '../common/types/linkData.type';
import { MOCK_DATA } from '../common/utils/fetchDefaultData';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const createUniqueId = (entries: Record<string, Entry>) => {
  let id = globalThis.crypto.randomUUID();
  while (entries[id]) {
    id = globalThis.crypto.randomUUID();
  }
  return id;
};

export function useLinkData(): LinkDataHook {
  const [currentOpenedLink, setCurrentOpenedLink] = useState<string | undefined>(undefined);
  const [allLinkData, setAllLinkData] = useState<Record<string, Entry>>(MOCK_DATA);
  const [isMutating, setIsMutating] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const setInitialOpenedLink = (pathId: string) => {
    setCurrentOpenedLink(pathId);
  };

  const getById = (id: string): Entry => {
    return allLinkData[id];
  };

  const openCreateModal = (parentId: string | null) => {
    setModalState({
      isOpen: true,
      mode: 'create',
      parentId,
      entryType: EntryType.FOLDER,
    });
  };

  const openEditModal = (entryId: string) => {
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
  };

  const closeModal = () => {
    setModalState(null);
  };

  const createEntry = async (payload: CreateEntryPayload) => {
    setIsMutating(true);

    try {
      await delay(250);

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
    } finally {
      setIsMutating(false);
    }
  };

  const updateEntry = async (payload: UpdateEntryPayload) => {
    setIsMutating(true);

    try {
      await delay(250);

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
    } finally {
      setIsMutating(false);
    }
  };

  return {
    allLinkData,
    getById,
    currentOpenedLink,
    isMutating,
    modalState,
    setInitialOpenedLink,
    createEntry,
    updateEntry,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
