import { appName } from '@/utils/constants';

export default function Footer() {
  return (
    <div className="z-5 mx-auto flex w-full max-w-screen-sm flex-col items-center justify-between px-5 pb-4 lg:mb-6 lg:max-w-full lg:flex-row xl:mb-2 xl:w-327.5 xl:pb-6">
      <p className="mb-6 text-center text-sm text-gray-600 md:text-base lg:mb-0">
        {appName} ©{new Date().getFullYear()} All Rights Reserved.
      </p>
    </div>
  );
}
