import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import Layout from '@/components/layout/Layout';
import TournamentCreatePage from '@/pages/TournamentCreatePage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: '/create', Component: TournamentCreatePage },
    ],
  },
]);

export default router;
