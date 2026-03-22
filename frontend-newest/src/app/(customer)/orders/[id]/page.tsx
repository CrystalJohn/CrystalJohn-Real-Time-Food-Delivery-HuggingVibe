'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderDetail, useOrder } from '@/features/orders';
import { orderService } from '@/features/orders/order.service';
import { mergeTrackingIntoOrder, useTracking } from '@/features/tracking';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { order, loading, error, refetch } = useOrder(orderId);

  const [cancelling, setCancelling] = useState(false);
  const [confirmingReceived, setConfirmingReceived] = useState(false);

  const {
    tracking,
    connected: trackingConnected,
    error: trackingError,
  } = useTracking(orderId, {
    enabled: Boolean(orderId),
    scope: 'customer',
  });

  const liveOrder = useMemo(() => {
    if (!order) return null;
    return mergeTrackingIntoOrder(order, tracking);
  }, [order, tracking]);

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      void refetch();
    }, 60000);

    return () => clearInterval(interval);
  }, [orderId, refetch]);

  const canCancel = liveOrder ? ['PENDING', 'CONFIRMED'].includes(liveOrder.status) : false;

  const canConfirmReceived =
    liveOrder?.status === 'DELIVERING' &&
    !liveOrder.deliveredAt &&
    !liveOrder.customerConfirmedDelivered;

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && <p className="text-center text-gray-600">Loading order...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {liveOrder && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              <span
                className={`inline-flex rounded-full px-3 py-1 font-medium ${
                  trackingConnected
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {trackingConnected
                  ? 'Tracking live via WebSocket'
                  : 'Tracking fallback mode'}
              </span>

              {trackingError && (
                <p className="mt-2 text-amber-600">
                  Không kết nối được realtime socket, hệ thống đang dùng refresh dự phòng.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {canCancel && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={async () => {
                    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

                    try {
                      setCancelling(true);
                      await orderService.cancelOrder(liveOrder.id);
                      await refetch();
                    } catch {
                      alert('Không thể hủy đơn hàng, vui lòng thử lại sau.');
                    } finally {
                      setCancelling(false);
                    }
                  }}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
                </button>
              )}

              {canConfirmReceived && (
                <button
                  type="button"
                  disabled={confirmingReceived}
                  onClick={async () => {
                    if (!confirm('Bạn xác nhận đã nhận được đơn hàng này?')) return;

                    try {
                      setConfirmingReceived(true);
                      await orderService.confirmDelivered(liveOrder.id);
                      await refetch();
                      alert('Đã ghi nhận xác nhận nhận hàng của bạn.');
                    } catch (err) {
                      alert(
                        err instanceof Error
                          ? err.message
                          : 'Không thể xác nhận nhận hàng, vui lòng thử lại sau.',
                      );
                    } finally {
                      setConfirmingReceived(false);
                    }
                  }}
                  className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {confirmingReceived ? 'Đang xác nhận...' : 'Đã nhận hàng'}
                </button>
              )}
            </div>
          </div>

          <OrderDetail order={liveOrder} />
        </div>
      )}
    </div>
  );
}