import { createContext, useContext } from 'react';
import { EntryType, type LinkDataHook } from '../common/types/linkData.type';

export const LinkHubContext = createContext<LinkDataHook>({
  allLinkData: {},
  currentOpenedLink: undefined,
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
});

export function useLinkHubData() {
  return useContext(LinkHubContext);
}
