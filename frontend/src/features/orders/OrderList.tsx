'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import type { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export function OrderList({ orders, onSelectOrder }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <ClipboardList className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900">Bạn chưa có đơn hàng nào</h2>
        <p className="mt-2 text-sm text-gray-500">
          Hãy bắt đầu với món yêu thích của bạn ngay hôm nay.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Khám phá menu
          </Link>
          <Link
            href="/promotions"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Xem khuyến mãi
          </Link>
        </div>
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