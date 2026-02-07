import type { Order } from "@/types/order";

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div>
      <p>Order #{order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: {order.totalAmount}</p>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} x {item.quantity} — {item.unitPrice * item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
