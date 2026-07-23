import { createContext, useContext } from 'react';
import { EntryType, type LinkDataHook } from '../common/types/linkData.type';

export const LinkHubContext = createContext<LinkDataHook>({
  allLinkData: {},
  currentOpenedLink: undefined,
  isMutating: false,
  modalState: null,
  setInitialOpenedLink: (_arg0) => {},
  getById: (_arg0) => {
    return {
      id: 'root',
      name: 'Root',
      type: EntryType.FOLDER,
      parentId: null,
      children: [],
    };
  },
  createEntry: async () => {},
  updateEntry: async () => {},
  deleteEntry: async () => {},
  searchEntries: () => [],
  openCreateModal: () => {},
  openEditModal: () => {},
  openDeleteModal: () => {},
  closeModal: () => {},
});

export function useLinkHubData() {
  return useContext(LinkHubContext);
}
