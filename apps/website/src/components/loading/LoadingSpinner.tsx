'use client';

import { Spinner } from '@heroui/react';
import React from 'react';

interface ILoadingSpinnerProps {
  size?: string;
}

const LoadingSpinner = ({ size }: ILoadingSpinnerProps) => {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner
        classNames={{
          wrapper: `${size || ''}`,
        }}
        size="sm"
        variant="gradient"
      />
    </div>
  );
};

export default LoadingSpinner;
