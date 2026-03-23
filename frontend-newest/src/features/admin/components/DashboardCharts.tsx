"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAdminStats } from "../useAdminStats";

const chartConfig = {
  value: {
    label: "Count",
    color: "#f97316", // Brand orange color
  },
} satisfies ChartConfig;

export function DashboardCharts() {
  const { stats, loading, error } = useAdminStats();

  const ordersData = useMemo(() => {
    if (!stats) return [];
    return [
      { category: "Total Orders", value: stats.totalOrders },
      { category: "Active Orders", value: stats.activeOrders },
      { category: "Delivered Today", value: stats.deliveredOrdersToday },
    ];
  }, [stats]);

  const userRoleData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Customers", value: stats.totalCustomers, color: "#3b82f6" },
      { name: "Drivers", value: stats.totalDrivers, color: "#10b981" },
      { name: "Staffs", value: stats.totalStaffs, color: "#f59e0b" },
    ];
  }, [stats]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-pulse">
        <div className="h-[400px] w-full bg-gray-200 rounded-xl" />
        <div className="h-[400px] w-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <div className="mt-8 text-red-500">Failed to load charts: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>Metrics spanning total, active, and today's deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={ordersData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Demographics</CardTitle>
          <CardDescription>Platform users spread by functional role</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
