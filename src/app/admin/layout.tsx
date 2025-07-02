import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Loader from '@/components/Loader/Loader';
import { verifySession } from '@/dal/verifySession';
import Navigation from '@/features/admin/components/Navigation';
import { ADMIN_NAVIGATION_ITEMS } from '@/features/admin/constants/constants';

const AdminContent = async ({ children }: { children: React.ReactNode }) => {
  const session = await verifySession();

  if (session.user.role !== 'admin' && session.user.role !== 'owner') {
    return redirect('/app');
  }

  return (
    <div className="flex w-full flex-col items-start justify-center p-6 pt-20">
      <div className="flex w-full flex-col items-start justify-start gap-4 border-gray-600 border-b pb-4 md:flex-row md:items-center md:gap-10">
        <div className="flex w-max flex-col items-start justify-center gap-2">
          <h1 className="w-full font-semibold text-3xl text-logo-main">
            Admin Panel
          </h1>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-gray-500 text-sm">{session.user.email}</h3>
            <span className="text-gray-500 text-sm">•</span>
            <h3 className="text-gray-500 text-sm">
              {session.user.role.charAt(0).toUpperCase() +
                session.user.role.slice(1)}
            </h3>
          </div>
        </div>
        <div className="hidden h-[35px] w-[1px] border-gray-500 border-l md:block" />
        {session && (
          <Navigation
            isOwner={session.user.role === 'owner'}
            items={ADMIN_NAVIGATION_ITEMS}
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
