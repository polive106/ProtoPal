import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});
