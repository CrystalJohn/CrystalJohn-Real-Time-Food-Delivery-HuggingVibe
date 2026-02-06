'use client';

import { StatsCards, DriverTable } from '@/features/admin';
import { PageContainer } from '@/components/layout';

export default function AdminDashboard() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of system metrics and management</p>
        </div>
        
        <StatsCards />
        
        <DriverTable />
      </div>
    </PageContainer>
  );
}

