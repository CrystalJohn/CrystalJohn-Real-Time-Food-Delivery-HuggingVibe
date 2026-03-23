'use client';

import { useState, useEffect } from 'react';
import type { AdminStats } from '../admin/admin.service';
import { adminService } from '../admin/admin.service';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, ordersData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentOrders(10)
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, recentOrders, loading, error, refetch: loadStats };
}
