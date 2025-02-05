import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

function hydrate() {
  const router = createBrowserRouter(routes);
  
  hydrateRoot(
    document,
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

hydrate();