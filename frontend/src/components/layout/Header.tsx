'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-red-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🍕 FoodDelivery
          </Link>

          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <>
                    <Link href="/menu" className="hover:underline">
                      Menu
                    </Link>
                    <Link href="/cart" className="hover:underline relative">
                      Cart
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/orders" className="hover:underline">
                      Orders
                    </Link>
                  </>
                )}
                {user?.role === 'STAFF' && (
                  <Link href="/orders" className="hover:underline">
                    Kitchen Queue
                  </Link>
                )}
                {user?.role === 'DRIVER' && (
                  <Link href="/jobs" className="hover:underline">
                    My Jobs
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                )}
                <button onClick={logout} className="hover:underline">
                  Logout ({user?.email})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
                <Link href="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
