export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ROUTES = {
  menu: "/menu",
  cart: "/cart",
  orders: (id: string) => `/orders/${id}`,
  staffOrders: "/staff/orders",
  driverJobs: "/driver/jobs",
  adminDashboard: "/admin/dashboard",
} as const;
