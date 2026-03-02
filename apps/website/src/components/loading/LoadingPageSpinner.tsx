'use client';

interface ILoadingPageSpinnerProps {
  wrapper?: string;
  spinner?: string;
}

const LoadingPageSpinner = ({ wrapper, spinner }: ILoadingPageSpinnerProps) => {
  return (
    <div className={`${wrapper} flex w-full items-center justify-center`}>
      <div className={`${spinner} size-16 animate-spin rounded-full border-t-4 border-blue-500`} />
    </div>
  );
};

export default LoadingPageSpinner;
