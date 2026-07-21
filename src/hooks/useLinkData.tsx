import { useState } from 'react';
import type { Entry, LinkDataHook } from '../common/types/linkData.type';
import { MOCK_DATA } from '../common/utils/fetchDefaultData';

export function useLinkData(): LinkDataHook {
  const [currentOpenedLink, setCurrentOpenedLink] = useState<string | undefined>(undefined);
  const [allLinkData, _setAllLinkData] = useState<Record<string, Entry>>(MOCK_DATA);

  const setInitialOpenedLink = (pathId: string) => {
    setCurrentOpenedLink(pathId);
  };

  const getById = (id: string): Entry => {
    return allLinkData[id];
  };

  return { allLinkData, getById, currentOpenedLink: currentOpenedLink, setInitialOpenedLink };
}
