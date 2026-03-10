import type { IRoute } from '@/types/navigation';

export const findCurrentRoute = (routes: IRoute[], pathname: string): IRoute | undefined => {
  for (const route of routes) {
    if (route.items) {
      const found = findCurrentRoute(route.items, pathname);
      if (found) return found;
    }
    if (pathname?.match(route.path) && route) return route;
  }
  return undefined;
};

export const getActiveRoute = (
  routes: IRoute[],
  pathname: string
): { name: string; path: string } => {
  const route = findCurrentRoute(routes, pathname);
  const currentPath = pathname.split('/').pop() || 'Main Dashboard';
  return { name: route?.name || currentPath, path: route?.path || '/' };
};

export const getActiveNavbar = (routes: IRoute[], pathname: string): boolean => {
  const route = findCurrentRoute(routes, pathname);
  return !!route?.secondary;
};

export const getActiveNavbarText = (routes: IRoute[], pathname: string): string | boolean => {
  return getActiveRoute(routes, pathname).name || false;
};
