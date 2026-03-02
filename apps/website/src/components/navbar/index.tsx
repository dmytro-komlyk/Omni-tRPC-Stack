'use client';

import { Listbox, ListboxItem, Image as NextUIImage, User } from '@heroui/react';
import { useThemeCookieStore, useUIStore } from '@package/store/ui';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import { LuLogOut } from 'react-icons/lu';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';

import Dropdown from '@/components/dropdown';
import NavLink from '@/components/link/NavLink';
import NotificationDropdown from '@/components/notification/NotificationDropdown';
import GeneralTabs from '@/components/tabs/GeneralTabs';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';

import { subRoutes } from '@/routes';
import type { IRoute } from '@/types/navigation';
import { getActiveRoute } from '@/utils/navigation';

import { useLogout } from '@/hooks/useLogout';
import avatar from '@/public/img/avatar.png';

interface INavbarProps {
  routes: IRoute[];
}

const Navbar = ({ routes }: INavbarProps) => {
  const pathname = usePathname();
  const activeRoute = getActiveRoute(routes, pathname);
  const { data: session } = useSession();
  const { handleLogout, isLoading } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const { isSideBarOpen, setSideBarOpen } = useUIStore();
  const { theme, setTheme } = useThemeCookieStore();

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const onSignOutClick = async () => {
    await handleLogout();
  };

  const handleDropdownChange = async (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const tabs = subRoutes[activeRoute.path.toLowerCase()] || [];

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="flex flex-col">
        {/* Breadcrumbs */}
        <NavbarBreadcrumbs />
        {/* Show tabs */}
        {tabs.length > 0 ? (
          <div className="mt-1">
            <GeneralTabs
              tabs={subRoutes[activeRoute.path.toLowerCase()] || []}
              sectionKey={activeRoute.path.toLowerCase()}
            />
          </div>
        ) : (
          <p className="shrink px-2 pt-3 text-xl text-gray-800 capitalize dark:text-white">
            <NavLink href="#" className="font-bold capitalize">
              {activeRoute.name}
            </NavLink>
          </p>
        )}
      </div>
      <div className="shadow-shadow-500 dark:bg-navy-800! relative flex h-15.25 w-50 max-w-50 grow items-center justify-around gap-2 rounded-full bg-white p-2 shadow-xl md:grow-0 dark:shadow-none">
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white"
          onClick={() => setSideBarOpen(!isSideBarOpen)}
        >
          <FiAlignJustify className="size-5" />
        </span>
        <NotificationDropdown />
        <button
          type="button"
          onClick={handleThemeToggle}
          className="flex cursor-pointer items-center gap-2 rounded bg-transparent text-gray-600 dark:text-white"
        >
          {theme === 'dark' ? (
            <RiSunFill className="size-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="size-4 text-gray-600 dark:text-white" />
          )}
        </button>
        {/* Profile & Dropdown */}
        <Dropdown
          isOpen={isOpen}
          onOpenChange={handleDropdownChange}
          button={
            <NextUIImage
              as={Image}
              width={40}
              height={40}
              className="cursor-pointer rounded-full"
              src={avatar.src}
              alt="User avatar"
            />
          }
          classNames="py-2 top-10 -left-[210px] w-max"
        >
          <div className="shadow-shadow-500 flex w-64 flex-col rounded-2xl border-1 bg-white p-2 shadow-xl dark:bg-gray-800 dark:text-white dark:shadow-none">
            {/* Header */}
            <div className="mb-4 flex justify-start px-2">
              <User
                avatarProps={{
                  size: 'sm',
                  src: avatar.src,
                }}
                classNames={{
                  name: 'text-text-center font-semibold text-gray-900 dark:text-white',
                }}
                name={`${session?.user?.nickName}`}
                description={session?.user?.email}
              />
            </div>

            {/* Divider */}
            <div className="mb-2 h-px w-full bg-gray-200 dark:bg-white/20" />

            {/* Menu items */}
            <div className="flex w-full flex-col gap-1">
              <Listbox aria-label="Listbox menu with sections" variant="flat">
                {/* List menu items */}
                <ListboxItem
                  key="delete"
                  color="danger"
                  onPress={onSignOutClick}
                  endContent={<LuLogOut className="size-5 text-red-500 hover:text-red-600" />}
                  classNames={{
                    base: 'hover:bg-red-100',
                    title: 'text-sm font-medium text-red-500  hover:text-red-600 lg:text-base',
                  }}
                  isDisabled={isLoading}
                >
                  Log Out
                </ListboxItem>
              </Listbox>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
