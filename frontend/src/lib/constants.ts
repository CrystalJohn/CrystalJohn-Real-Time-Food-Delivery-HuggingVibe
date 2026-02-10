export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ROUTES = {
  CUSTOMER: '/menu',
  STAFF: '/staff/tickets',
  DRIVER: '/driver/jobs',
  ADMIN: '/admin/dashboard',
  menu: "/menu",
  cart: "/cart",
  orders: (id: string) => `/orders/${id}`,
} as const;
