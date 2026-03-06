'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import { usePathname } from 'next/navigation';

import NavLink from '@/components/link/NavLink';
import routes, { subRoutes } from '@/routes';

const NavbarBreadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, idx) => {
    const href = `/${segments.slice(0, idx + 1).join('/')}`;

    const mainRoute = routes.find((r) => r.path === segment);

    if (mainRoute) {
      return {
        label: mainRoute.name,
        href,
      };
    }

    const parent = segments[0] as keyof typeof subRoutes;
    const sub = subRoutes[parent]?.find((s: any) => s.path === segment);

    if (sub) {
      return {
        label: sub.name,
        href,
      };
    }

    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href,
    };
  });

  return (
    <Breadcrumbs
      radius="full"
      variant="solid"
      classNames={{
        list: 'text-gray-800 dark:!bg-navy-800 bg-white px-3 dark:shadow-none',
      }}
    >
      <BreadcrumbItem>
        <NavLink href="/">Home</NavLink>
      </BreadcrumbItem>
      {breadcrumbs.map((bc) => (
        <BreadcrumbItem key={bc.href}>
          <NavLink href={bc.href}>{bc.label}</NavLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};

export default NavbarBreadcrumbs;
