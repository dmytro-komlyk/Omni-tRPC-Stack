'use client';

import { Badge, Button, Link as NextUILink } from '@heroui/react';
import { NotificationSchema } from '@package/api/schema';
import Link from 'next/link';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { BiSolidError } from 'react-icons/bi';
import { FaCircleInfo, FaSquareCheck } from 'react-icons/fa6';
import { GrStatusCritical } from 'react-icons/gr';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdKeyboardDoubleArrowDown } from 'react-icons/md';
import { RiErrorWarningFill } from 'react-icons/ri';

import Dropdown from '@/components/dropdown';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { baseUrl } from '@/utils/constants';

export type SeverityLevel = 'info' | 'warning' | 'error' | 'success' | 'critical';

export const mapSeverityIcon: Record<SeverityLevel, ReactNode> = {
  info: <FaCircleInfo color="oklch(62.3% 0.214 259.815)" />,
  warning: <RiErrorWarningFill color="orange" />,
  error: <BiSolidError color="oklch(63.7% 0.237 25.331)" />,
  success: <FaSquareCheck color="green" />,
  critical: <GrStatusCritical color="oklch(50.5% 0.213 27.518)" />,
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationSchema.NotificationData[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleMarkAllAsRead = async () => {
    try {
      // add mark all notifications as read logic here, e.g. call an API endpoint
      setNotifications([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDropdownChange = async (value: boolean) => {
    setIsOpen(value);
    if (value) {
      setIsLoadingInitial(true);
      try {
        // add fetch notifications logic here, e.g. call an API endpoint
      } catch (error) {
        console.log('Error fetching notifications:', error);
      } finally {
        setIsLoadingInitial(false);
      }
    } else {
      setNotifications([]);
      setPage(0);
    }
  };

  const handleLoadMore = async () => {
    if (notifications.length === 0) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      // add fetch more notifications logic here, e.g. call an API endpoint with pagination
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [notifications]);

  // const total = getNotifications.data?.total ?? 0;
  const total = 0;
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={handleDropdownChange}
      button={
        <Badge
          isInvisible={total === 0}
          size="sm"
          color="primary"
          content={total}
          shape="circle"
          classNames={{ badge: 'text-[8px]' }}
        >
          <button type="button" className="cursor-pointer border-none bg-transparent p-0">
            <IoMdNotificationsOutline className="size-5 text-gray-600 dark:text-white" />
          </button>
        </Badge>
      }
      animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
      classNames="py-2 top-4 -left-[230px] md:-left-[440px] w-max"
    >
      <div className="shadow-shadow-500 dark:bg-navy-700! flex w-87.5 flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl sm:w-115 dark:text-white dark:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <p className="text-navy-700 text-base font-bold dark:text-white">Notification</p>

            <NextUILink
              as={Link}
              href={`${baseUrl}/notifications/history`}
              color="primary"
              underline="always"
              className="text-base font-semibold"
            >
              History
            </NextUILink>
          </div>
          <Button
            // isDisabled={markAllNotificationsAsRead.isPending || total === 0}
            onPress={handleMarkAllAsRead}
            className="bg-blueSecondary hover:bg-brand-600 active:bg-brand-700 dark:hover:bg-brand-300 dark:active:bg-brand-200 size-fit min-w-fit px-3 py-2 text-sm font-normal text-white transition duration-200"
          >
            Mark all read
          </Button>
        </div>
        {isLoadingInitial ? (
          <div className="flex w-full items-center justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex w-full items-center justify-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </div>
        ) : (
          <div ref={containerRef} className="flex max-h-100 flex-col gap-2 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="dark:border-navy-600 flex items-center rounded-lg border-1 border-gray-200 bg-gray-300/30 p-2 dark:bg-gray-800/70"
              >
                <div className="flex w-fit items-center justify-center rounded-xl bg-linear-to-b text-3xl text-white">
                  {/* {mapSeverityIcon[notification.severity]} */}
                </div>
                {/* <div className="ml-2 flex size-full flex-col justify-center gap-1 rounded-lg px-1 text-sm">
                  <p className="text-left text-base font-bold text-gray-800 dark:text-white/90">
                    {notification.title}
                  </p>
                  <p className="text-left text-sm text-gray-700 dark:text-gray-400">
                    {notification.message}
                  </p>
                </div> */}
                <div className="font-base flex basis-1/5 justify-center text-xs text-gray-900 dark:text-white">
                  {/* {notification.action && (
                    <Button
                      as={Link}
                      href={notification.action.url}
                      color="primary"
                      variant="ghost"
                      onPress={() => setIsOpen(false)}
                    >
                      {notification.action.label}
                    </Button>
                  )} */}
                </div>
              </div>
            ))}
            {isLoadingMore && (
              <div className="flex w-full items-center justify-center py-2">
                <LoadingSpinner />
              </div>
            )}
          </div>
        )}

        {notifications.length < total && (
          <div className="flex items-center justify-center">
            <Button
              isIconOnly
              aria-label="Load more notifications"
              onPress={handleLoadMore}
              className="bg-transparent text-gray-900 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent"
            >
              <MdKeyboardDoubleArrowDown className="animate-bounce" size={32} />
            </Button>
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationDropdown;
