'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  PhoneCall,
  RefreshCw,
  Search,
  Truck,
  UserRound,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { OrderStatus } from '@/types';
import {
  staffService,
  type StaffOrderResponse,
  type StaffOrderTrackingResponse,
} from './staff.service';
import { useStaffOrders } from './useStaffOrders';

type QueueFilter = 'all' | OrderStatus;
type CallOutcome = 'none' | 'confirmed' | 'cancelled';

interface CallPanelState {
  isOpen: boolean;
  hasCalled: boolean;
  outcome: CallOutcome;
  cancelReason: string;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN');

function getStatusClass(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'CONFIRMED':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'PREPARING':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'READY':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'DELIVERING':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'DELIVERED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'CANCELLED':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}

function getElapsedMinutes(createdAt: string): number {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 60000));
}

function defaultPanelState(): CallPanelState {
  return {
    isOpen: false,
    hasCalled: false,
    outcome: 'none',
    cancelReason: '',
  };
}

export function StaffOrderQueue() {
  const router = useRouter();
  const { orders, isLoading, error, refetch } = useStaffOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<QueueFilter>('all');
  const [callPanels, setCallPanels] = useState<Record<string, CallPanelState>>({});
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<StaffOrderResponse | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<StaffOrderTrackingResponse | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const updateCallPanel = (
    orderId: string,
    updater: (prev: CallPanelState) => CallPanelState,
  ) => {
    setCallPanels((prev) => {
      const current = prev[orderId] ?? defaultPanelState();
      return {
        ...prev,
        [orderId]: updater(current),
      };
    });
  };

  const getPanelState = (orderId: string): CallPanelState =>
    callPanels[orderId] ?? defaultPanelState();

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders
      .filter((order) => {
        const isAssignedReady = order.status === 'READY' && Boolean(order.driverId || order.driver);
        if (isAssignedReady) return false;

        const statusMatch = filterStatus === 'all' || order.status === filterStatus;
        if (!statusMatch) return false;

        if (!normalizedSearch) return true;

        const byOrderId = order.id.toLowerCase().includes(normalizedSearch);
        const byCustomer = (order.customer?.fullName ?? '')
          .toLowerCase()
          .includes(normalizedSearch);
        const byPhone = (order.customer?.phone ?? '').includes(normalizedSearch);
        const byItems = order.items
          .map((item) => item.menuItem?.name ?? '')
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

        return byOrderId || byCustomer || byPhone || byItems;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();

        if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
        if (Number.isNaN(timeA)) return 1;
        if (Number.isNaN(timeB)) return -1;

        return timeB - timeA;
      });
  }, [orders, searchTerm, filterStatus]);

  const pendingCount = orders.filter((order) => order.status === 'PENDING').length;
  const confirmedCount = orders.filter((order) => order.status === 'CONFIRMED').length;
  const readyCount = orders.filter(
    (order) => order.status === 'READY' && !Boolean(order.driverId || order.driver),
  ).length;
  const cancelledCount = orders.filter((order) => order.status === 'CANCELLED').length;

  const runAction = async (orderId: string, handler: () => Promise<void>) => {
    if (processingOrderId) return;

    setActionError(null);
    setProcessingOrderId(orderId);

    try {
      await handler();
      await refetch();
    } catch (err) {
      console.error('[StaffOrderQueue.action] failed', { orderId, err });
      const message = err instanceof Error ? err.message : 'Action failed';
      setActionError(message);
      toast.error(message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCallCustomer = (orderId: string) => {
    updateCallPanel(orderId, (prev) => ({
      ...prev,
      isOpen: true,
      hasCalled: false,
    }));
  };

  const handleCallNow = (orderId: string) => {
    updateCallPanel(orderId, (prev) => ({
      ...prev,
      hasCalled: true,
    }));
  };

  const handleCustomerConfirmed = async (orderId: string) => {
    await runAction(orderId, async () => {
      await staffService.updateOrderStatus(orderId, 'CONFIRMED');
      updateCallPanel(orderId, (prev) => ({
        ...prev,
        isOpen: true,
        hasCalled: true,
        outcome: 'confirmed',
      }));
      toast.success(`Customer confirmed order #${orderId}`);
    });
  };

  const handleCancelReasonChange = (orderId: string, reason: string) => {
    updateCallPanel(orderId, (prev) => ({
      ...prev,
      outcome: 'cancelled',
      cancelReason: reason,
    }));
  };

  const handleCancelOrder = async (orderId: string) => {
    const panel = getPanelState(orderId);
    if (!panel.cancelReason.trim()) {
      toast.error('Please enter cancellation reason');
      return;
    }

    await runAction(orderId, async () => {
      await staffService.cancelOrder(orderId, panel.cancelReason.trim());
      updateCallPanel(orderId, () => defaultPanelState());
      toast.success(`Order #${orderId} cancelled`);
    });
  };

  const handleStartKitchen = async (orderId: string) => {
    await runAction(orderId, async () => {
      await staffService.updateOrderStatus(orderId, 'PREPARING');
      toast.success(`Order #${orderId} moved to PREPARING`);
    });
  };

  const handleMarkReady = async (orderId: string) => {
    await runAction(orderId, async () => {
      await staffService.updateOrderStatus(orderId, 'READY');
      toast.success(`Order #${orderId} is READY. Assign a driver to continue.`);
    });
  };

  const handleOpenOrderDetail = async (orderId: string) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setTrackingError(null);
    setSelectedOrderTracking(null);

    const [detailResult, trackingResult] = await Promise.allSettled([
      staffService.getOrderById(orderId),
      staffService.getOrderTracking(orderId),
    ]);

    if (detailResult.status === 'fulfilled') {
      setSelectedOrderDetail(detailResult.value);
    } else {
      console.error('[StaffOrderQueue.getOrderById] failed', { orderId, err: detailResult.reason });
      setSelectedOrderDetail(null);
      setDetailError(
        detailResult.reason instanceof Error
          ? detailResult.reason.message
          : 'Failed to load order details',
      );
    }

    if (trackingResult.status === 'fulfilled') {
      setSelectedOrderTracking(trackingResult.value);
    } else {
      console.error('[StaffOrderQueue.getOrderTracking] failed', {
        orderId,
        err: trackingResult.reason,
      });
      setTrackingError('Tracking details are temporarily unavailable.');
    }

    setDetailLoading(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading kitchen queue...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-1 text-3xl font-bold text-amber-700">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">Confirmed</p>
            <p className="mt-1 text-3xl font-bold text-blue-700">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Ready for Delivery</p>
            <p className="mt-1 text-3xl font-bold text-green-700">{readyCount}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">Cancelled</p>
            <p className="mt-1 text-3xl font-bold text-red-700">{cancelledCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order id, customer, phone, item..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex w-full items-center gap-3 lg:w-auto">
            <div className="flex w-full items-center gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1.5 lg:w-auto">
              <Filter className="ml-2 h-4 w-4 text-gray-400" />
              {(['all', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'CANCELLED'] as QueueFilter[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                      filterStatus === status
                        ? 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => void refetch()}
              title="Refresh orders"
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order) => {
          const elapsedMinutes = getElapsedMinutes(order.createdAt);
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const panel = getPanelState(order.id);
          const isProcessing = processingOrderId === order.id;
          const driverName = order.driver?.fullName || order.driver?.name || 'Driver';
          const showAssignDriver = order.status === 'READY' && !Boolean(order.driverId || order.driver);
          const showOutForDelivery =
            order.status === 'READY' && Boolean(order.driverId || order.driver);

          return (
            <Card
              key={order.id}
              className="cursor-pointer overflow-hidden border-0 bg-white shadow-md transition hover:shadow-lg"
              onClick={() => {
                void handleOpenOrderDetail(order.id);
              }}
            >
              <CardHeader className="space-y-3 border-b border-gray-100 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">Order #{order.id}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusClass(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="mt-2 flex items-center justify-end text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {elapsedMinutes} min ago
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
                  <div className="flex items-center text-sm font-medium text-gray-800">
                    <UserRound className="mr-1.5 h-4 w-4 text-gray-500" />
                    {order.customer?.fullName || `Customer #${order.customerId.slice(0, 4)}`}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{order.customer?.phone || '-'}</p>
                </div>

                {showOutForDelivery && (
                  <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 p-2.5">
                    <div className="text-sm text-blue-800">
                      Driver: <span className="font-semibold">{driverName}</span>
                    </div>
                    <Badge className="bg-blue-600 text-white">Notified</Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items ({itemCount})
                  </h4>
                  {order.items.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-0"
                    >
                      <div className="flex min-w-0 gap-2">
                        <img
                          src={item.menuItem.imageUrl || '/assets/images/no_image.png'}
                          alt={item.menuItem.name}
                          className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                            <span className="mr-1 text-orange-600">{item.quantity}x</span>
                            {item.menuItem.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.menuItem.category || '-'}</p>
                        </div>
                      </div>
                      <p className="ml-2 whitespace-nowrap text-sm font-bold text-gray-700">
                        {currencyFormatter.format(item.lineTotal)} VND
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Payment</span>
                    <span className="font-medium">
                      {order.paymentMethod || '-'} / {order.paymentStatus || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-lg font-bold text-red-600">
                      {currencyFormatter.format(order.totalAmount)} VND
                    </span>
                  </div>
                </div>

                <div
                  className="mt-4 space-y-2"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  {order.status === 'PENDING' && (
                    <>
                      {!panel.isOpen && (
                        <Button
                          className="w-full bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleCallCustomer(order.id)}
                          disabled={isProcessing}
                        >
                          <PhoneCall className="mr-2 h-4 w-4" />
                          {`Call ${order.customer?.phone?.trim() || 'Customer'} to Confirm`}
                        </Button>
                      )}

                      {panel.isOpen && (
                        <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                          <p className="text-sm font-medium text-blue-900">Customer Confirmation</p>
                          <p className="text-xs text-blue-700">
                            Call the customer first, then choose Accept or Reject.
                          </p>

                          <div className="rounded-md border border-blue-200 bg-white p-2.5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                              Customer Phone
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-900">
                              {order.customer?.phone?.trim() || 'Phone number is missing'}
                            </p>
                          </div>

                          <a
                            href={order.customer?.phone?.trim() ? `tel:${order.customer.phone.trim()}` : '#'}
                            onClick={(event) => {
                              if (!order.customer?.phone?.trim()) {
                                event.preventDefault();
                                toast.error('Customer phone number is missing');
                                return;
                              }
                              handleCallNow(order.id);
                            }}
                            className={`inline-flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                              order.customer?.phone?.trim()
                                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            }`}
                          >
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Call Now
                          </a>

                          {panel.hasCalled && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={panel.outcome === 'confirmed' ? 'default' : 'outline'}
                                className={
                                  panel.outcome === 'confirmed'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : ''
                                }
                                disabled={isProcessing}
                                onClick={() => void handleCustomerConfirmed(order.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant={panel.outcome === 'cancelled' ? 'destructive' : 'outline'}
                                disabled={isProcessing}
                                onClick={() =>
                                  updateCallPanel(order.id, (prev) => ({
                                    ...prev,
                                    outcome: 'cancelled',
                                  }))
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {panel.outcome === 'cancelled' && (
                            <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-2.5">
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-red-200 bg-white text-red-700 hover:bg-red-100"
                                  onClick={() => handleCancelReasonChange(order.id, 'No answer')}
                                  disabled={isProcessing}
                                >
                                  No Answer
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-red-200 bg-white text-red-700 hover:bg-red-100"
                                  onClick={() => handleCancelReasonChange(order.id, 'Customer cancelled')}
                                  disabled={isProcessing}
                                >
                                  Customer Cancelled
                                </Button>
                              </div>
                              <textarea
                                value={panel.cancelReason}
                                onChange={(e) =>
                                  handleCancelReasonChange(order.id, e.target.value)
                                }
                                placeholder="Enter reject reason..."
                                className="h-20 w-full rounded-md border border-red-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                              />
                              <Button
                                className="w-full"
                                variant="destructive"
                                disabled={isProcessing}
                                onClick={() => void handleCancelOrder(order.id)}
                              >
                                Confirm Reject Order
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <Button
                      className="w-full bg-orange-600 text-white hover:bg-orange-700"
                      disabled={isProcessing}
                      onClick={() => void handleStartKitchen(order.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept & Start Kitchen
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                      disabled={isProcessing}
                      onClick={() => void handleMarkReady(order.id)}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Mark Ready
                    </Button>
                  )}

                  {showAssignDriver && (
                    <Button
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                      disabled={isProcessing}
                      onClick={() => router.push(`/tickets/${order.id}/assign-driver`)}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Assign Driver
                    </Button>
                  )}

                  {showOutForDelivery && (
                    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" disabled>
                      <Truck className="mr-2 h-4 w-4" />
                      Out for Delivery
                    </Button>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-2 text-center text-sm text-red-700">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      Order cancelled
                    </div>
                  )}

                  {order.status === 'DELIVERING' && (
                    <div className="rounded-md border border-indigo-200 bg-indigo-50 p-2 text-center text-sm text-indigo-700">
                      <Truck className="mr-1 inline h-4 w-4" />
                      Driver is delivering
                    </div>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-center text-sm text-emerald-700">
                      <CheckCircle2 className="mr-1 inline h-4 w-4" />
                      Delivered
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
          <p className="font-medium text-gray-500">No orders matched current filters</p>
          <p className="mt-1 text-sm text-gray-400">Try another keyword or status.</p>
        </div>
      )}

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailError(null);
            setTrackingError(null);
            setSelectedOrderTracking(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#d9dce3] bg-white text-slate-900 shadow-2xl sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOrderDetail ? `Order #${selectedOrderDetail.id}` : 'Order Details'}
            </DialogTitle>
            <DialogDescription>
              Customer info and requested items from `GET /staff/orders/{'{orderId}'}`.
            </DialogDescription>
          </DialogHeader>

          {detailLoading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Loading order details...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {detailError}
            </div>
          )}

          {!detailLoading && !detailError && selectedOrderDetail && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Customer Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedOrderDetail.customer?.fullName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {selectedOrderDetail.customer?.phone || '-'}
                    </p>
                    {selectedOrderDetail.customer?.phone && (
                      <a
                        href={`tel:${selectedOrderDetail.customer.phone}`}
                        className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <PhoneCall className="mr-1 h-3.5 w-3.5" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">
                    {selectedOrderDetail.customer?.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Payment</p>
                  <p className="font-semibold text-gray-900">
                    {selectedOrderDetail.paymentMethod || '-'} / {selectedOrderDetail.paymentStatus || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">{selectedOrderDetail.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                  <p className="font-semibold text-red-600">
                    {currencyFormatter.format(selectedOrderDetail.totalAmount)} VND
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Customer Request</p>
                <p className="mt-1 text-gray-900">
                  {selectedOrderDetail.notes?.trim() || 'No special request from customer.'}
                </p>
              </div>

              {selectedOrderTracking && (
                <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Delivery Address</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrderTracking.delivery?.addressText || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Store</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrderTracking.store?.name || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedOrderTracking.store?.address || '-'}
                    </p>
                  </div>
                </div>
              )}

              {trackingError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {trackingError}
                </div>
              )}

              <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Items ({selectedOrderDetail.items.length})
                </p>
                {selectedOrderDetail.items.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {item.quantity}x {item.menuItem.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.menuItem.description || '-'}</p>
                      <p className="text-xs text-gray-500">Category: {item.menuItem.category || '-'}</p>
                    </div>
                    <p className="ml-3 whitespace-nowrap font-semibold text-gray-800">
                      {currencyFormatter.format(item.lineTotal)} VND
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
