import { api } from '@/lib/api';
import type { Order } from '@/types';

export type TrackingScope = 'customer' | 'staff';

export interface TrackingLocation {
  lat: number;
  lng: number;
  timestamp?: string | null;
}

export interface TrackingData {
  orderId: string;
  status: string;
  driverLocation?: TrackingLocation | null;
  deliveryLocation?: { lat: number; lng: number } | null;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  driverConfirmedDelivered?: boolean;
  customerConfirmedDelivered?: boolean;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
}

function getNestedRecord(value: unknown, key: string): UnknownRecord | undefined {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
}

function normalizeOrderStatus(raw: string | undefined): Order['status'] | undefined {
  if (!raw) return undefined;

  const upper = raw.toUpperCase();

  if (upper === 'PICKED_UP') return 'DELIVERING';

  const supported: Order['status'][] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERING',
    'DELIVERED',
    'CANCELLED',
  ];

  return supported.includes(upper as Order['status'])
    ? (upper as Order['status'])
    : undefined;
}

export function normalizeTrackingData(payload: unknown): TrackingData {
  const record = isRecord(payload) ? payload : {};
  const driver = getNestedRecord(record, 'driver');
  const currentLocation = driver ? getNestedRecord(driver, 'currentLocation') : undefined;
  const delivery = getNestedRecord(record, 'delivery');

  const flatLat = asNumber(record.currentLat);
  const flatLng = asNumber(record.currentLng);

  const nestedLat = asNumber(currentLocation?.lat);
  const nestedLng = asNumber(currentLocation?.lng);

  const driverLocation =
    flatLat != null && flatLng != null
      ? {
          lat: flatLat,
          lng: flatLng,
          timestamp: asString(record.lastLocationAt ?? record.timestamp) ?? null,
        }
      : nestedLat != null && nestedLng != null
        ? {
            lat: nestedLat,
            lng: nestedLng,
            timestamp:
              asString(currentLocation?.lastLocationAt ?? currentLocation?.timestamp) ?? null,
          }
        : null;

  const deliveryLat = asNumber(delivery?.lat ?? record.deliveryLat);
  const deliveryLng = asNumber(delivery?.lng ?? record.deliveryLng);

  return {
    orderId: asString(record.orderId ?? record.id) ?? '',
    status: asString(record.status) ?? '',
    driverLocation,
    deliveryLocation:
      deliveryLat != null && deliveryLng != null
        ? { lat: deliveryLat, lng: deliveryLng }
        : null,
    assignedAt: asString(record.assignedAt) ?? null,
    pickedUpAt: asString(record.pickedUpAt) ?? null,
    deliveredAt: asString(record.deliveredAt) ?? null,
    driverConfirmedDelivered: asBoolean(record.driverConfirmedDelivered),
    customerConfirmedDelivered: asBoolean(record.customerConfirmedDelivered),
  };
}

export function mergeTrackingData(
  current: TrackingData | null,
  incoming: TrackingData | null,
): TrackingData | null {
  if (!incoming) return current;
  if (!current) return incoming;

  return {
    orderId: incoming.orderId || current.orderId,
    status: incoming.status || current.status,
    driverLocation:
      incoming.driverLocation !== undefined ? incoming.driverLocation : current.driverLocation,
    deliveryLocation:
      incoming.deliveryLocation !== undefined
        ? incoming.deliveryLocation
        : current.deliveryLocation,
    assignedAt: incoming.assignedAt ?? current.assignedAt ?? null,
    pickedUpAt: incoming.pickedUpAt ?? current.pickedUpAt ?? null,
    deliveredAt: incoming.deliveredAt ?? current.deliveredAt ?? null,
    driverConfirmedDelivered:
      incoming.driverConfirmedDelivered ?? current.driverConfirmedDelivered,
    customerConfirmedDelivered:
      incoming.customerConfirmedDelivered ?? current.customerConfirmedDelivered,
  };
}

export function mergeTrackingIntoOrder(order: Order, tracking: TrackingData | null): Order {
  if (!tracking) return order;

  const nextStatus = normalizeOrderStatus(tracking.status);

  return {
    ...order,
    status: nextStatus ?? order.status,
    deliveryLocation:
      tracking.deliveryLocation !== undefined
        ? tracking.deliveryLocation
        : order.deliveryLocation ?? null,
    driverLocation:
      tracking.driverLocation !== undefined
        ? tracking.driverLocation
        : order.driverLocation ?? null,
    deliveredAt: tracking.deliveredAt ?? order.deliveredAt,
    driverConfirmedDelivered:
      tracking.driverConfirmedDelivered ?? order.driverConfirmedDelivered,
    customerConfirmedDelivered:
      tracking.customerConfirmedDelivered ?? order.customerConfirmedDelivered,
  };
}

export const trackingService = {
  async getTracking(orderId: string, scope: TrackingScope = 'customer'): Promise<TrackingData> {
    const endpoint =
      scope === 'staff'
        ? `/staff/orders/${orderId}/tracking`
        : `/orders/${orderId}/tracking`;

    const payload = await api.get<unknown>(endpoint);
    return normalizeTrackingData(payload);
  },
};