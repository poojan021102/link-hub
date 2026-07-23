export enum EntryType {
  FOLDER = 'FOLDER',
  URL = 'URL',
}

export enum EntryCategory {
  FOLDER = 'FOLDER',
  URL = 'URL',
  SEARCH = 'SEARCH',
}

export interface BaseEntry {
  id: string;
  name: string;
  type: EntryType;
  parentId: string | null;
}

export interface FolderEntry extends BaseEntry {
  type: EntryType.FOLDER;
  children: string[];
}

export interface UrlEntry extends BaseEntry {
  type: EntryType.URL;
  url: string;
  description: string;
}

export type Entry = FolderEntry | UrlEntry;

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  entryId?: string;
  parentId: string | null;
  entryType: EntryType;
}

export interface CreateEntryPayload {
  name: string;
  type: EntryType;
  parentId: string | null;
  url?: string;
  description?: string;
}

export interface UpdateEntryPayload {
  entryId: string;
  name: string;
  url?: string;
  description?: string;
}

export interface LinkDataHook {
  allLinkData: Record<string, Entry>;
  currentOpenedLink?: string;
  isMutating: boolean;
  modalState: ModalState | null;
  setInitialOpenedLink: (arg0: string) => void;
  getById: (id: string) => Entry;
  searchEntries: (startFolderId: string, query: string, category: EntryCategory) => Entry[];
  createEntry: (payload: CreateEntryPayload) => Promise<void>;
  updateEntry: (payload: UpdateEntryPayload) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  openCreateModal: (parentId: string | null) => void;
  openEditModal: (entryId: string) => void;
  openDeleteModal: (entryId: string) => void;
  closeModal: () => void;
}
