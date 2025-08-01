import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import Layout from '@/components/layout/Layout';
import TournamentCreatePage from '@/pages/TournamentCreatePage';
import TournamentDashboard from '@/pages/TournamentDashboard';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: '/register', Component: RegisterPage },
      { path: '/login', Component: LoginPage },
      { path: '/create', Component: TournamentCreatePage },
      { path: '/dashboard/:id', Component: TournamentDashboard },
    ],
  },
]);

export default router;
