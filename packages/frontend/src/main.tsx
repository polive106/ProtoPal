import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ToastProvider } from './providers/ToastProvider';
import { queryClient } from './lib/queryClient';
import { routeTree } from './routeTree.gen';
import './styles/index.css';

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <InnerApp />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
