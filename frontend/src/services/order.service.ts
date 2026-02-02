import { api } from "./api";
import type { Order } from "@/types/order";

export const orderService = {
  getById: (id: string) => api.get<Order>(`/orders/${id}`),

  create: (payload: { items: Order["items"]; total: number }) =>
    api.post<Order>("/orders", payload),

  list: () => api.get<Order[]>("/orders"),
};
