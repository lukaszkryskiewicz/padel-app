import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import Layout from '@/components/layout/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [{ index: true, Component: HomePage }],
  },
]);

export default router;
