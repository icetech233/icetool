import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';

const JwtDecodePage = lazy(() => import('./pages/JwtDecodePage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/jwt" replace /> },
      { path: 'jwt', element: <JwtDecodePage /> },
      { path: 'base64', element: <ComingSoonPage /> },
      { path: 'url', element: <ComingSoonPage /> },
      { path: '*', element: <Navigate to="/jwt" replace /> },
    ],
  },
]);
