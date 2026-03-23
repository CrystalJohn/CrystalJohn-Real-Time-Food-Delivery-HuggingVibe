"use client";

import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/components/ui";
import { useAdminStats } from "./useAdminStats";
import { DollarSign, Package, Flame, Users } from "lucide-react";

export function StatsCards() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: `$${Number(stats.todayRevenue ?? 0).toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4 text-slate-500" />,
      subtext: "Calculated across today's sales",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: <Package className="h-4 w-4 text-slate-500" />,
      subtext: "All-time accumulated orders",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders.toLocaleString(),
      icon: <Flame className="h-4 w-4 text-slate-500" />,
      subtext: "Currently pending or preparing",
    },
    {
      title: "Online Drivers",
      value: stats.activeDrivers.toLocaleString(),
      icon: <Users className="h-4 w-4 text-slate-500" />,
      subtext: "Drivers available right now",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {cards.map((card) => (
        <Card key={card.title} className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-tight text-slate-800">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
