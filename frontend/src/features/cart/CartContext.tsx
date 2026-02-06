'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { MenuItem, OrderItem } from '@/types';

interface CartContextValue {
  items: OrderItem[];
  totalAmount: number;
  itemCount: number;
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartItemsFromStorage(): OrderItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cart_items');
  return stored ? JSON.parse(stored) : [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>(cartItemsFromStorage);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (menuItem: MenuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity,
          unitPrice: menuItem.price,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
