'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/constants';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Utensils, 
  ListOrdered, 
  Menu as MenuIcon, 
  X
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/menu/categories', icon: ListOrdered },
  { name: 'Menu Items', href: '/admin/menu/items', icon: Utensils },
  { name: 'Drivers', href: '/admin/drivers', icon: UserCog },
  { name: 'Staffs', href: '/admin/staffs', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  if (loading || !isAuthenticated || user?.role !== 'ADMIN') {
    return <div className="min-h-screen bg-[#eef1f6]" />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef1f6] text-slate-800">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">FoodGo Admin</span>
          </Link>
          <button 
            className="lg:hidden text-slate-500 hover:text-red-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Management
          </p>
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-red-600' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="z-30 flex h-16 w-full flex-shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-red-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="hidden text-lg font-semibold text-slate-900 sm:block">
              {ADMIN_NAV_ITEMS.find((i) => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden flex-col items-end sm:flex">
               <span className="text-sm font-semibold text-slate-900">{user?.name || 'Administrator'}</span>
               <span className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</span>
             </div>
             <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
