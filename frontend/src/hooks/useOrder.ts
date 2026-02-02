"use client";

import { useState, useCallback } from "react";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types/order";

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load order"));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { order, loading, error, fetchOrder };
}
