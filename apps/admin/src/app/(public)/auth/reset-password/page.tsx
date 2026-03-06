import ResetPassword from '@/components/auth/ResetPassword';
import Default from '@/components/auth/variants/DefaultAuthLayout';
import { LuKeyRound } from 'react-icons/lu';

async function ResetPasswordDefault({
  searchParams,
}: {
  searchParams: Promise<{ token: string; email: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <Default
      maincard={
        <div className="relative flex h-full w-full items-center justify-center px-4">
          <div className="z-10 w-full max-w-112.5 overflow-hidden rounded-3xl border-1 border-navy-700/10 bg-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-navy-900/90">
            <div className="flex items-center justify-between bg-amber-500 px-8 py-3 dark:bg-amber-600">
              <div className="flex items-center gap-2">
                <LuKeyRound className="size-4 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                  Credential Recovery Protocol
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-white/20" />
                <div className="size-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h3 className="mb-2 text-3xl font-black tracking-tight text-navy-800 dark:text-white">
                New Password
              </h3>
              <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                Authorized recovery for{' '}
                <span className="text-navy-700 dark:text-brand-400 font-bold">{email}</span>. Ensure
                your new credentials meet the system complexity requirements.
              </p>

              <ResetPassword token={token} email={email} />

              <div className="mt-8 space-y-2 rounded-2xl border-1 border-dashed border-gray-200 p-4 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Password Strength Requirements:
                </p>
                <ul className="list-inside list-disc text-[11px] text-gray-500 dark:text-gray-400">
                  <li>Minimum 12 characters</li>
                  <li>Include symbols and numbers</li>
                  <li>Avoid repetitive patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default ResetPasswordDefault;
