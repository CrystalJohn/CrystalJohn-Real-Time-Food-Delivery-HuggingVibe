'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const role = user?.role?.toUpperCase();
    if (role && role !== 'ADMIN') {
      const roleRoutes: Record<string, string> = {
        CUSTOMER: ROUTES.CUSTOMER,
        STAFF: ROUTES.STAFF,
        DRIVER: ROUTES.DRIVER,
      };
      router.replace(roleRoutes[role] || ROUTES.CUSTOMER);
    }
  }, [isAuthenticated, loading, router, user?.role]);

  return <div className="min-h-screen bg-[#eef1f6]">{children}</div>;
}
