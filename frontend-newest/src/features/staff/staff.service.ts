import { api } from '@/lib/api';
import type { KitchenTicket, OrderStatus } from '@/types';

export interface StaffOrderCustomer {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface StaffOrderDriver {
  userId?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  isOnline?: boolean;
  status?: string;
  vehicleType?: string | null;
  licensePlate?: string | null;
  currentLocation?: {
    lat?: number | null;
    lng?: number | null;
    lastLocationAt?: string | null;
  } | null;
}

export interface StaffOrderMenuItem {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface StaffOrderItem {
  orderItemId: string;
  quantity: number;
  price: number;
  lineTotal: number;
  menuItem: StaffOrderMenuItem;
}

export interface StaffOrderResponse {
  id: string;
  customerId: string;
  customer?: StaffOrderCustomer | null;
  driverId?: string | null;
  driver?: StaffOrderDriver | null;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount: number;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  driverConfirmedDelivered?: boolean;
  customerConfirmedDelivered?: boolean;
  items: StaffOrderItem[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface StaffOrderTrackingLocation {
  addressText?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface StaffOrderTrackingStore {
  name?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface StaffOrderTrackingResponse {
  orderId: string;
  status: OrderStatus;
  driver?: StaffOrderDriver | null;
  delivery?: StaffOrderTrackingLocation | null;
  store?: StaffOrderTrackingStore | null;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  driverConfirmedDelivered?: boolean;
  customerConfirmedDelivered?: boolean;
}

export interface StaffAvailableDriver {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  userIsActive?: boolean;
  status?: string;
  isOnline?: boolean;
  vehicleType?: string | null;
  licensePlate?: string | null;
  updatedAt?: string | null;
}

export const staffService = {
  async getOrders(): Promise<StaffOrderResponse[]> {
    return api.get<StaffOrderResponse[]>('/staff/orders');
  },

  async getOrderById(orderId: string): Promise<StaffOrderResponse> {
    return api.get<StaffOrderResponse>(`/staff/orders/${orderId}`);
  },

  async getOrderTracking(orderId: string): Promise<StaffOrderTrackingResponse> {
    return api.get<StaffOrderTrackingResponse>(`/staff/orders/${orderId}/tracking`);
  },

  // PATCH /api/staff/orders/{orderId}/status
  async updateOrderStatus(
    orderId: string,
    status: Extract<OrderStatus, 'CONFIRMED' | 'PREPARING' | 'READY'>,
  ): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/status`, { status });
  },

  async getAvailableDrivers(): Promise<StaffAvailableDriver[]> {
    const data = await api.get<StaffAvailableDriver[] | StaffAvailableDriver>(
      '/staff/orders/available-drivers',
    );
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  async assignDriver(orderId: string, driverId: string): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/assign-driver`, { driverId });
  },

  async cancelOrder(orderId: string, reason: string): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/cancel`, { reason });
  },

  async getQueue(): Promise<KitchenTicket[]> {
    return api.get<KitchenTicket[]>('/staff/queue');
  },

  async acceptTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/accept`);
  },

  async completeTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/complete`);
  },

  async rejectTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/reject`);
  },
};
