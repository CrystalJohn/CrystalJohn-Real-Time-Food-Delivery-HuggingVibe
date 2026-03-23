"use client";

import Link from "next/link";
import { StatsCards } from "@/features/admin";
import { DashboardCharts } from "@/features/admin/components/DashboardCharts";
import { Button } from "@/components/ui";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <StatsCards />
        <DashboardCharts />

        {/* <div className="flex flex-wrap gap-3">
          <Link href="/admin/staffs">
            <Button variant="outline">Staffs</Button>
          </Link>
          <Link href="/admin/drivers">
            <Button variant="outline">Drivers</Button>
          </Link>
          <Link href="/admin/menu/categories">
            <Button variant="outline">Menu Categories</Button>
          </Link>
          <Link href="/admin/menu/items">
            <Button variant="outline">Menu Items</Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
