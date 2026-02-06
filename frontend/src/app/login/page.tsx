'use client';

import Link from 'next/link';
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">🍕 FoodDelivery</h1>
          <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
