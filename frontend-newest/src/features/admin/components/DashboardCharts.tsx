"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, PieChart, Pie, Label } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAdminStats } from "../useAdminStats";

const ordersAreaConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


const userRoleConfig = {
  users: {
    label: "Users",
  },
  customers: {
    label: "Customers",
    color: "hsl(var(--chart-1))",
  },
  drivers: {
    label: "Drivers",
    color: "hsl(var(--chart-2))",
  },
  staffs: {
    label: "Staffs",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function DashboardCharts() {
  const { stats, recentOrders, loading, error } = useAdminStats();

  // Build daily order counts from Mar 10 2026 to today, filling gaps with 0
  const areaChartData = useMemo(() => {
    const startDate = new Date(2026, 2, 10); // March 10, 2026
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Count orders per day
    const countsMap: Record<string, number> = {};
    if (recentOrders?.length) {
      recentOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
      });
    }

    // Generate continuous date range
    const result: { date: string; orders: number }[] = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      result.push({ date: dateKey, orders: countsMap[dateKey] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [recentOrders]);

  const totalOrders = useMemo(
    () => areaChartData.reduce((acc, curr) => acc + curr.orders, 0),
    [areaChartData]
  );

  const userRoleData = useMemo(() => {
    if (!stats) return [];
    return [
      { role: "customers", label: "Customers", value: stats.totalCustomers, fill: "var(--color-customers)" },
      { role: "drivers", label: "Drivers", value: stats.totalDrivers, fill: "var(--color-drivers)" },
      { role: "staffs", label: "Staffs", value: stats.totalStaffs, fill: "var(--color-staffs)" },
    ];
  }, [stats]);

  const totalUsers = useMemo(() => {
    return userRoleData.reduce((acc, curr) => acc + curr.value, 0);
  }, [userRoleData]);

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
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-4">
      <Card className="col-span-1 lg:col-span-4 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Recent Orders</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Daily order ({totalOrders} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ordersAreaConfig} className="h-[280px] w-full">
            <AreaChart
              accessibilityLayer
              data={areaChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={48}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="orders"
                type="natural"
                fill="var(--color-orders)"
                fillOpacity={0.4}
                stroke="var(--color-orders)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium text-slate-800">
                {totalOrders} orders placed <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="col-span-1 lg:col-span-3 flex flex-col rounded-xl shadow-sm">
        <CardHeader className="items-center pb-0">
          <CardTitle>User Demographics</CardTitle>
          <CardDescription>Platform users spread by functional role</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={userRoleConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={userRoleData}
                dataKey="value"
                nameKey="role"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-slate-900 text-3xl font-bold tracking-tight"
                          >
                            {totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-slate-500 font-medium text-sm"
                          >
                            Total Users
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col pb-6 text-sm">
          <div className="flex w-full items-center justify-center gap-2 font-semibold text-slate-800">
            Active user base snapshot <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-center text-slate-500 mt-1">
            Current real-time data from all roles
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
