import { api } from "@/lib/api";
import type { User, Order } from "@/types";

export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeDrivers: number;

  // backend trả thêm, để sẵn dùng dashboard
  totalUsers: number;
  totalCustomers: number;
  totalStaffs: number;
  totalDrivers: number;
  deliveredOrdersToday: number;
  deliveredItemsToday: number;
  driversWithDeliveriesToday: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats>("/admin/stats");
  },

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return api.get<Order[]>(`/admin/orders?limit=${limit}`);
  },

  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>("/admin/users");
  },

  async getDriverPerformanceToday(): Promise<any> {
    return api.get<any>("/admin/dashboard/drivers/today");
  },
};
