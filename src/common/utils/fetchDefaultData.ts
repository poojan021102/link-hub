import { EntryType, type Entry } from '../types/linkData.type';

export const MOCK_DATA: Record<string, Entry> = {
  root: {
    id: 'root',
    name: 'Root',
    type: EntryType.FOLDER,
    parentId: null,
    children: ['f1', 'u2'],
  },
  f1: {
    id: 'f1',
    name: 'Programming',
    type: EntryType.FOLDER,
    parentId: 'root',
    children: ['u1'],
  },
  u1: {
    id: 'u1',
    name: 'React Docs',
    description: 'root',
    type: EntryType.URL,
    parentId: 'f1',
    url: 'https://react.dev',
  },
  u2: {
    id: 'u2',
    name: 'React Docs',
    description: 'root',
    type: EntryType.URL,
    parentId: 'root',
    url: 'https://react.dev',
  },
};
