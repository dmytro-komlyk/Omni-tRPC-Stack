'use client';

import { CircularProgress } from '@heroui/react';
import React from 'react';
import { FaFileArrowDown } from 'react-icons/fa6';

interface ILoadingFileSpinnerProps {
  className?: string;
  classNames?: {
    circular?: string;
    icon?: string;
  };
  isCompleted: boolean;
  isError: boolean;
}

const LoadingFileSpinner = ({
  className,
  isCompleted,
  isError,
  classNames,
}: ILoadingFileSpinnerProps) => {
  return (
    <div className={`relative flex w-fit items-center ${className}`}>
      <CircularProgress
        classNames={{
          svg: `w-24 h-24 drop-shadow-md ${!isCompleted && !isError && 'animate-slow-spin'}`,
          indicator: [
            isCompleted ? 'stroke-green-500' : 'stroke-primary',
            isError && 'stroke-red-500',
          ],
          value: 'hidden',
        }}
        value={isCompleted || isError ? 100 : 30}
        showValueLabel
        strokeWidth={2}
      />
      <FaFileArrowDown size={36} className={`absolute left-[32%] ${classNames?.icon}`} />
    </div>
  );
};

export default LoadingFileSpinner;
