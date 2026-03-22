'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

type PanelRole = 'STAFF' | 'DRIVER';

interface NavItem {
  href: string;
  label: string;
}

interface RolePanelShellProps {
  children: React.ReactNode;
  role: PanelRole;
  homeHref: string;
  panelTitle: string;
  navItems: NavItem[];
}

const fallbackRouteMap: Record<string, string> = {
  CUSTOMER: ROUTES.CUSTOMER,
  STAFF: ROUTES.STAFF,
  DRIVER: ROUTES.DRIVER,
  ADMIN: ROUTES.ADMIN,
};

export function RolePanelShell({
  children,
  role,
  homeHref,
  panelTitle,
  navItems,
}: RolePanelShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== role) {
      router.replace(fallbackRouteMap[user.role] || '/login');
    }
  }, [loading, role, router, user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !user || user.role !== role) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                <span className="text-xl font-bold text-white">F</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold text-gray-900 group-hover:text-red-600">
                  FoodGo
                </p>
                <p className="text-xs text-gray-500">{panelTitle}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {role === 'STAFF' ? 'Staff Panel' : 'Driver Panel'}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {user.name || user.email}
              </p>
            </div>

            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}