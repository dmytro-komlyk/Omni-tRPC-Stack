'use client';

import { appName } from '@/utils/constants';

const Footer = () => {
  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pt-3 pb-8 lg:px-8">
      <p className="mb-4 text-center text-sm font-medium text-gray-600 sm:mb-! md:text-lg">
        <span className="mb-4 text-center text-sm text-gray-600 sm:mb-0! md:text-base">
          {appName} ©{new Date().getFullYear()} All Rights Reserved.
        </span>
      </p>
    </div>
  );
};

export default Footer;
