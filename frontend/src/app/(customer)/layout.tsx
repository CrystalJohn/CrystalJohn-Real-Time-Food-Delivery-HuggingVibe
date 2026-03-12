'use client';

import { CustomerHeader } from '@/components/layout/CustomerHeader';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { useAuth } from '@/features/auth';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();

  const shouldShowCustomerHeader =
    !loading && isAuthenticated && user?.role === 'CUSTOMER';

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowCustomerHeader ? <CustomerHeader /> : <LandingHeader />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
