'use client';

import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  PREPARING: { label: 'Preparing', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  READY: { label: 'Ready', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  DELIVERING: { label: 'Delivering', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  DELIVERED: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
}
