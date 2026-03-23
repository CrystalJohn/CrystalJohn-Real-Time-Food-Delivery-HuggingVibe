'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const role = user?.role?.toUpperCase();
    if (role && role !== 'CUSTOMER') {
      const roleRoutes: Record<string, string> = {
        STAFF: ROUTES.STAFF,
        DRIVER: ROUTES.DRIVER,
        ADMIN: ROUTES.ADMIN,
      };
      router.replace(roleRoutes[role] || ROUTES.CUSTOMER);
    }
  }, [isAuthenticated, loading, router, user?.role]);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}