'use client';

import { appName, baseUrl } from '@/utils/constants';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Link as NextUILink,
  User,
} from '@heroui/react';
import { useSession } from '@package/next-auth';
import { useState } from 'react';
import { LuLogOut } from 'react-icons/lu';

import { useLogout } from '@/hooks/useLogout';

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { handleLogout, isLoading } = useLogout();

  const dropdownItems = [
    {
      key: 'logout',
      label: 'Log Out',
      Icon: LuLogOut,
      onPress: () => handleLogout('manual'),
    },
  ];

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      classNames={{
        base: 'w-full bg-lightPrimary dark:bg-navy-900',
        wrapper: '!container mx-auto',
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden"
        />

        <NavbarBrand>
          <NextUILink
            as={Link}
            className="text-landing-dark-grey-900 text-2xl font-extrabold dark:text-white"
            href={`${baseUrl}`}
          >
            {appName}
          </NextUILink>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop menu */}
      {session ? (
        <NavbarContent as="div" justify="end">
          <Dropdown
            placement="bottom-end"
            classNames={{
              base: 'w-64 border-1 rounded-2xl',
              content: 'bg-white dark:bg-gray-800',
            }}
          >
            <DropdownTrigger>
              <Avatar
                as="button"
                className="cursor-pointer transition-transform"
                name={session.user.nickName || session.user.email?.[0]}
                size="md"
                src={session.user.avatarUrl || undefined}
                isDisabled={isLoading}
              />
            </DropdownTrigger>

            <DropdownMenu
              aria-label="User menu"
              variant="flat"
              classNames={{ base: 'rounded-xl', list: 'gap-1' }}
            >
              <DropdownSection showDivider aria-label="Profile & Actions">
                <DropdownItem
                  key="profile"
                  isReadOnly
                  className="gap-2 opacity-100 hover:cursor-default"
                >
                  <User
                    avatarProps={{
                      size: 'sm',
                      src: session.user.avatarUrl || undefined,
                    }}
                    classNames={{
                      name: 'text-center font-semibold text-gray-900 dark:text-white',
                    }}
                    name={session.user.nickName || 'User'}
                    description={session.user.email}
                  />
                </DropdownItem>
              </DropdownSection>

              <DropdownSection aria-label="Actions">
                {dropdownItems.map(({ key, label, Icon, onPress }) => (
                  <DropdownItem
                    key={key}
                    textValue={label}
                    className="text-danger"
                    color="danger"
                    classNames={{
                      base: 'w-full data-[hover=true]:bg-red-100 dark:data-[hover=true]:bg-red-600/20',
                      title: 'text-sm lg:text-base font-medium',
                    }}
                    endContent={<Icon className="size-5" />}
                    onPress={onPress}
                  >
                    {label}
                  </DropdownItem>
                ))}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      ) : (
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex gap-2">
            <Button
              as={Link}
              href={`${baseUrl}/auth/sign-in`}
              variant="light"
              className="font-medium"
            >
              Log In
            </Button>
            <Button
              as={Link}
              href={`${baseUrl}/auth/sign-up`}
              className="bg-brand-500 text-white font-medium rounded-xl"
            >
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
      )}
    </Navbar>
  );
};

export default Header;
