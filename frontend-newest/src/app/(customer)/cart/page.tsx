'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';

export default function CartPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  // Redirect all roles to /support when accessing /cart
  useEffect(() => {
    if (!authLoading) {
      router.replace('/support');
    }
  }, [authLoading, router]);

  return null;
}
