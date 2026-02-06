import { api } from '@/lib/api';
import type { Order, OrderItem } from '@/types';

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryAddress: string;
}

export const orderService = {
  async create(data: CreateOrderRequest): Promise<Order> {
    return api.post<Order>('/orders', data);
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async getMyOrders(): Promise<Order[]> {
    return api.get<Order[]>('/orders/my');
  },

  async cancelOrder(id: string): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/cancel`);
  },
};
