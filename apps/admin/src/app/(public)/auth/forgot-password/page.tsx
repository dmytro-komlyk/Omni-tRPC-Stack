import ForgotPassword from '@/components/auth/ForgotPassword';
import Default from '@/components/auth/variants/DefaultAuthLayout';
import { LuMailQuestion } from 'react-icons/lu';

async function ForgotPasswordDefault() {
  return (
    <Default
      maincard={
        <div className="relative flex h-full w-full items-center justify-center px-4">
          <div className="z-10 w-full max-w-112.5 overflow-hidden rounded-3xl border-1 border-navy-700/10 bg-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-navy-900/90">
            <div className="flex items-center justify-between bg-indigo-600 px-8 py-3 dark:bg-indigo-500">
              <div className="flex items-center gap-2">
                <LuMailQuestion className="size-4 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                  Identity Verification Needed
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-white/20" />
                <div className="size-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h3 className="mb-2 text-3xl font-black tracking-tight text-navy-800 dark:text-white">
                Account Recovery
              </h3>
              <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                Lost your access? Provide your registered email, and the system will generate a
                secure recovery link.
              </p>

              <ForgotPassword />

              <div className="mt-8 rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-500/10 border-1 border-indigo-100 dark:border-indigo-500/20">
                <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
                  <strong>Note:</strong> Check your spam folder if you don't receive the email
                  within 2 minutes. The link will be active for exactly 1 hour.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default ForgotPasswordDefault;
