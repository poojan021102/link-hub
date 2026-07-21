import { createBrowserRouter } from 'react-router';
import OpenRoute from '../pages/OpenRoute/OpenRoute';
import RootLayout from './RootLayout';

export const routes = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        path: ':id',
        Component: OpenRoute,
      },
    ],
  },
]);
