import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';

const JwtDecodePage = lazy(() => import('./pages/JwtDecodePage'));
const Base64Page = lazy(() => import('./pages/Base64Page'));
const UrlCodecPage = lazy(() => import('./pages/UrlCodecPage'));
const ColorLabPage = lazy(() => import('./pages/ColorLabPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/jwt" replace /> },
      { path: 'jwt', element: <JwtDecodePage /> },
      { path: 'base64', element: <Base64Page /> },
      { path: 'url', element: <UrlCodecPage /> },
      { path: 'color', element: <ColorLabPage /> },
      { path: '*', element: <Navigate to="/jwt" replace /> },
    ],
  },
]);
