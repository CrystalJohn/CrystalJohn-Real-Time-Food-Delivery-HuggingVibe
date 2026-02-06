"use client";

import { AuthProvider } from "@/features/auth";
import { CartProvider } from "@/features/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
