'use client';

import { PageContainer } from '@/components/layout';
import { DriverTable } from '@/features/admin';

export default function DriversPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Driver Management</h1>
          <p className="text-gray-600">Manage and monitor delivery drivers</p>
        </div>
        
        <DriverTable />
      </div>
    </PageContainer>
  );
}
