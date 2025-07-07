import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import Layout from '@/components/layout/Layout';
import TournamentCreatePage from '@/pages/TournamentCreatePage';
import TournamentDashboard from '@/pages/TournamentDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: '/create', Component: TournamentCreatePage },
      { path: '/dashboard/:id', Component: TournamentDashboard },
    ],
  },
]);

export default router;
