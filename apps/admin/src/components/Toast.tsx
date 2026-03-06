import type {
  DefaultToastOptions,
  Renderable,
  ToastPosition,
  ValueOrFunction,
} from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';
import { FaCheck } from 'react-icons/fa6';
import { MdOutlineError } from 'react-icons/md';

import LoadingSpinner from '@/components/loading/LoadingSpinner';

type PromiseOptions<T> = {
  loading: Renderable;
  success: ValueOrFunction<Renderable, T>;
  error: ValueOrFunction<Renderable, any>;
};

interface IToastNotificationProps {
  position?: ToastPosition;
  duration?: number;
  className?: string;
}

const ToastNotification = ({
  position = 'top-center',
  duration = 4000,
  className = '',
}: IToastNotificationProps) => {
  const toasterConfig = {
    position,
    toastOptions: {
      duration,
      className: 'toast-base',
      success: {
        className: 'toast-success',
        icon: <FaCheck size={18} className="fill-success" />,
      },
      error: {
        className: 'toast-error',
        icon: <MdOutlineError size={20} className="fill-danger" />,
      },
      loading: {
        className: 'toast-loading',
        icon: <LoadingSpinner size="18" />,
      },
    },
  };

  return (
    <Toaster
      position={toasterConfig.position}
      toastOptions={toasterConfig.toastOptions}
      containerClassName={className}
    />
  );
};

export const showToast = {
  promise: <T,>(
    func: Promise<T>,
    options: PromiseOptions<T>,
    additionalOptions?: DefaultToastOptions
  ) => toast.promise(func, options, additionalOptions),
  loading: (message: string, options = {}) => toast.loading(message, options),
  blank: (message: string, options = {}) => toast(message, options),
  success: (message: string, options = {}) => toast.success(message, options),
  error: (message: string, options = {}) => toast.error(message, options),
  dismiss: (toastId: string) => toast.dismiss(toastId),
  remove: (toastId: string) => toast.remove(toastId),
};

export default ToastNotification;
