'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth';

export function Sidebar() {
  const { user } = useAuth();

  if (!user || user.role === 'CUSTOMER') return null;

  const getMenuItems = () => {
    switch (user.role) {
      case 'STAFF':
        return [
          { href: '/orders', icon: '🍳', label: 'Kitchen Queue' },
        ];
      case 'DRIVER':
        return [
          { href: '/jobs', icon: '🚗', label: 'My Deliveries' },
        ];
      case 'ADMIN':
        return [
          { href: '/dashboard', icon: '📊', label: 'Dashboard' },
          { href: '/drivers', icon: '🚗', label: 'Drivers' },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        {getMenuItems().map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
