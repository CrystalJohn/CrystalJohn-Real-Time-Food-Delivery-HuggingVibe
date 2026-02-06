'use client';

import { useRouter } from 'next/navigation';
import { OrderList, useOrders } from '@/features/orders';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error } = useOrders();

  const handleSelectOrder = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {loading && <p className="text-center text-gray-600">Loading orders...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && (
        <OrderList orders={orders} onSelectOrder={handleSelectOrder} />
      )}
    </div>
  );
}
