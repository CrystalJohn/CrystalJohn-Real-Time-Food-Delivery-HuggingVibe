'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PageContainer } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  getDeliveryConfirmationMessage,
  jobService,
} from '@/features/driver/job.service';
import { ETAOverlay, TrackingMap } from '@/features/tracking';
import type { DeliveryJob } from '@/types';

function buildGoogleMapsDirectionsUrl(params: {
  destinationLatLng?: { lat: number; lng: number } | null;
  destinationAddress?: string | null;
  originLatLng?: { lat: number; lng: number } | null;
}): string | null {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const destination = params.destinationLatLng
    ? `${params.destinationLatLng.lat},${params.destinationLatLng.lng}`
    : params.destinationAddress?.trim()
      ? params.destinationAddress.trim()
      : null;

  if (!destination) return null;

  const qs = new URLSearchParams();
  qs.set('destination', destination);
  qs.set('travelmode', 'driving');

  if (params.originLatLng) {
    qs.set('origin', `${params.originLatLng.lat},${params.originLatLng.lng}`);
  }

  return `${base}&${qs.toString()}`;
}

export default function DriverJobDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [job, setJob] = useState<
    (DeliveryJob & {
      statusRaw?: string;
      driverConfirmedDelivered?: boolean;
      customerConfirmedDelivered?: boolean;
      deliveryLocation?: { lat: number; lng: number } | null;
      driverLocation?: { lat: number; lng: number; timestamp?: string | null } | null;
    }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [openingDirections, setOpeningDirections] = useState(false);

  const refetch = useCallback(async () => {
    const data = await jobService.getMyOrderDetail(orderId);
    setJob(data ?? null);
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await jobService.getMyOrderDetail(orderId);
        if (!cancelled) {
          setJob(data ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handlePickup = async () => {
    setProcessing(true);

    try {
      const updated = await jobService.pickupJob(orderId);
      setJob(updated);

      try {
        await jobService.updateMyLocation(orderId);
        await refetch();
      } catch {
        void 0;
      }

      toast.success('Order marked as PICKED_UP.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cannot update order status.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeliver = async () => {
    setProcessing(true);

    try {
      try {
        await jobService.updateMyLocation(orderId);
        await refetch();
      } catch {
        // GPS fail does not block the driver from confirming delivery
      }

      const updated = await jobService.deliverJob(orderId);
      setJob(updated);

      toast.success(getDeliveryConfirmationMessage(updated));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cannot update order status.');
    } finally {
      setProcessing(false);
    }
  };

  const shouldAutoShare =
    job?.status === 'PICKED_UP' &&
    !job.driverConfirmedDelivered &&
    !job.deliveredAt;

  useEffect(() => {
    if (!shouldAutoShare) return;

    const id = setInterval(() => {
      void (async () => {
        try {
          await jobService.updateMyLocation(orderId);
          await refetch();
        } catch {
          // ignore background errors
        }
      })();
    }, 15000);

    return () => clearInterval(id);
  }, [orderId, refetch, shouldAutoShare]);

  if (loading) {
    return (
      <PageContainer>
        <p className="text-gray-600">Loading...</p>
      </PageContainer>
    );
  }

  if (error || !job) {
    return (
      <PageContainer>
        <p className="text-red-600">{error ?? 'Order not found'}</p>
        <Link href="/jobs" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
          ← Back to Jobs
        </Link>
      </PageContainer>
    );
  }

  const canPickup = job.status === 'ASSIGNED';
  const canDeliver =
    job.status === 'PICKED_UP' &&
    !job.driverConfirmedDelivered &&
    !job.deliveredAt;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Order #{String(orderId).slice(0, 8)}</h1>
          <Link href="/jobs" className="text-sm text-gray-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>

        <Card className="space-y-3 p-4">
          <div>
            <p className="font-semibold">Delivery map</p>
            <p className="text-sm text-gray-600">
              Delivery location (customer) & driver location (if tracked).
            </p>
          </div>

          <div className="relative">
            <TrackingMap
              deliveryAddress="Delivery"
              deliveryLocation={job.deliveryLocation ?? null}
              driverLocation={
                job.driverLocation
                  ? {
                      lat: job.driverLocation.lat,
                      lng: job.driverLocation.lng,
                      timestamp: job.driverLocation.timestamp ?? new Date().toISOString(),
                    }
                  : undefined
              }
            />

            <ETAOverlay
              driverLocation={
                job.driverLocation
                  ? { lat: job.driverLocation.lat, lng: job.driverLocation.lng }
                  : null
              }
              deliveryLocation={job.deliveryLocation ?? null}
            />

            <button
              type="button"
              disabled={openingDirections}
              onClick={async () => {
                const destinationUrl = buildGoogleMapsDirectionsUrl({
                  destinationLatLng: job.deliveryLocation ?? null,
                  destinationAddress: null,
                  originLatLng: null,
                });

                if (!destinationUrl) {
                  alert('No delivery coordinates available (customer denied Location permissions).');
                  return;
                }

                setOpeningDirections(true);

                try {
                  let originLatLng: { lat: number; lng: number } | null = null;

                  try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                      if (!navigator.geolocation) {
                        return reject(new Error('Geolocation not supported'));
                      }

                      navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 5000,
                      });
                    });

                    originLatLng = {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    };
                  } catch {
                    originLatLng = null;
                  }

                  const url = buildGoogleMapsDirectionsUrl({
                    destinationLatLng: job.deliveryLocation ?? null,
                    destinationAddress: null,
                    originLatLng,
                  });

                  if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                } finally {
                  setOpeningDirections(false);
                }
              }}
              className="absolute bottom-3 right-3 z-10 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Directions (Google Maps)
            </button>
          </div>

          {job.deliveryAddress ? (
            <p className="text-xs text-gray-500">Delivery Location: {job.deliveryAddress}</p>
          ) : !job.deliveryLocation ? (
            <p className="text-xs text-gray-500">No delivery address provided.</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              {job.customerName && (
                <p className="text-sm text-gray-600">
                  Customer: {job.customerName}
                  {job.customerPhone ? ` • ${job.customerPhone}` : ''}
                </p>
              )}

              <p className="mt-0.5 text-sm text-gray-500">
                Status:{' '}
                {job.status === 'ASSIGNED'
                  ? 'ASSIGNED'
                  : job.status === 'PICKED_UP'
                    ? 'PICKED_UP'
                    : job.status === 'DELIVERED'
                      ? 'DELIVERED'
                      : job.status === 'CANCELLED'
                        ? 'CANCELLED'
                        : job.status}
              </p>

              {job.driverConfirmedDelivered && !job.customerConfirmedDelivered && (
                <p className="mt-1 text-xs text-amber-600">
                  The driver has confirmed delivery. The system is awaiting customer confirmation.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {canPickup && (
                <button
                  onClick={handlePickup}
                  disabled={processing}
                  className="rounded bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  Received
                </button>
              )}

              {canDeliver && (
                <button
                  onClick={handleDeliver}
                  disabled={processing}
                  className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm Delivery
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}