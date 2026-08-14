import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';

const JwtDecodePage = lazy(() => import('./pages/JwtDecodePage'));
const Base64Page = lazy(() => import('./pages/Base64Page'));
const UrlCodecPage = lazy(() => import('./pages/UrlCodecPage'));
const ColorLabPage = lazy(() => import('./pages/ColorLabPage'));
const JsonLabPage = lazy(() => import('./pages/JsonLabPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/json" replace /> },
      { path: 'jwt', element: <JwtDecodePage /> },
      { path: 'base64', element: <Base64Page /> },
      { path: 'url', element: <UrlCodecPage /> },
      { path: 'color', element: <ColorLabPage /> },
      { path: 'json', element: <JsonLabPage /> },
      { path: '*', element: <Navigate to="/json" replace /> },
    ],
  },
]);
