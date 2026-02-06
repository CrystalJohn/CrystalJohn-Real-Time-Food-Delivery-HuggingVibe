'use client';

import type { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export function OrderList({ orders, onSelectOrder }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onSelectOrder?.(order)}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</p>
              <p className="text-gray-600 text-sm">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
            <p className="text-lg font-bold text-red-600">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
