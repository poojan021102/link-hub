export enum EntryType {
  FOLDER = 'FOLDER',
  URL = 'URL',
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
  name: string;
  description: string;
}

export type Entry = FolderEntry | UrlEntry;

export interface LinkDataHook {
  allLinkData: Record<string, Entry>;
  currentOpenedLink?: string;
  setInitialOpenedLink: (arg0: string) => void;
  getById: (id: string) => Entry;
}
