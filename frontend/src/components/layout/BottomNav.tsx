'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || user.role !== 'CUSTOMER') return null;

  const navItems = [
    { href: '/menu', icon: '🍕', label: 'Menu' },
    { href: '/cart', icon: '🛒', label: 'Cart' },
    { href: '/orders', icon: '📦', label: 'Orders' },
    { href: '/', icon: '👤', label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 ${
                isActive ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
