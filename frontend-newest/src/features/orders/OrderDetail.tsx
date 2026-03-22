'use client';

import type { Order } from '@/types';
import { ETAOverlay, TrackingMap } from '@/features/tracking';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailProps {
  order: Order;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN');

function formatDate(value?: string): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleString('vi-VN');
}

function getDeliveryConfirmationNote(order: Order): string | null {
  if (order.status === 'DELIVERED' || order.deliveredAt) {
    return 'Đơn hàng đã hoàn tất.';
  }

  if (order.driverConfirmedDelivered && !order.customerConfirmedDelivered) {
    return 'Tài xế đã xác nhận giao hàng. Vui lòng bấm "Đã nhận hàng" nếu bạn đã nhận được đơn.';
  }

  if (!order.driverConfirmedDelivered && order.customerConfirmedDelivered) {
    return 'Bạn đã xác nhận đã nhận hàng. Hệ thống đang chờ tài xế xác nhận hoàn tất.';
  }

  if (order.driverConfirmedDelivered && order.customerConfirmedDelivered) {
    return 'Cả hai bên đã xác nhận giao hàng thành công.';
  }

  return null;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const deliveryConfirmationNote = getDeliveryConfirmationNote(order);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h2>
          <p className="text-gray-600">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {deliveryConfirmationNote && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {deliveryConfirmationNote}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">Theo dõi đơn hàng</h3>

        {order.driverLocation || order.deliveryLocation ? (
          <>
            <div className="relative">
              <TrackingMap
                deliveryAddress={order.deliveryAddress || 'Delivery'}
                deliveryLocation={order.deliveryLocation ?? null}
                driverLocation={
                  order.driverLocation
                    ? {
                        lat: order.driverLocation.lat,
                        lng: order.driverLocation.lng,
                        timestamp: order.driverLocation.timestamp ?? new Date().toISOString(),
                      }
                    : undefined
                }
              />

              <ETAOverlay
                driverLocation={
                  order.driverLocation
                    ? { lat: order.driverLocation.lat, lng: order.driverLocation.lng }
                    : null
                }
                deliveryLocation={order.deliveryLocation ?? null}
              />
            </div>

            {!order.deliveryLocation && (
              <p className="text-xs text-gray-500">
                Chưa có tọa độ điểm giao (customer chưa cấp quyền Location khi đặt hàng).
              </p>
            )}

            {!order.driverLocation && (
              <p className="text-xs text-gray-500">
                Tài xế chưa gửi vị trí, bản đồ sẽ cập nhật khi tài xế bắt đầu chia sẻ vị trí.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Chưa có dữ liệu vị trí. Bản đồ sẽ hiển thị khi khách cho phép Location lúc đặt hàng hoặc
            tài xế gửi vị trí.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {currencyFormatter.format(item.unitPrice)} VND x {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {currencyFormatter.format(item.unitPrice * item.quantity)} VND
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-red-600">{currencyFormatter.format(order.totalAmount)} VND</span>
        </div>
      </div>
    </div>
  );
}