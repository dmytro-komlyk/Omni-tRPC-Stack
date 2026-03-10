'use client';

import { Spinner } from '@heroui/react';

interface ILoadingDataSpinnerProps {
  label: string;
  className?: string;
  classNames?: {
    label?: string;
    dots?: string;
  };
}

const LoadingDataSpinner = ({ label, className, classNames }: ILoadingDataSpinnerProps) => {
  return (
    <div
      className={`dark:bg-navy-800! flex size-full items-center justify-center bg-white ${className}`}
    >
      <Spinner
        className="flex-row-reverse gap-1"
        classNames={{
          label: `text-gray-800/80 dark:text-white/80 ${classNames?.label}`, // text-xl
          dots: `bg-gray-800/80 dark:bg-white/80 ${classNames?.dots}`,
        }}
        label={label}
        variant="dots"
      />
    </div>
  );
};

export default LoadingDataSpinner;
