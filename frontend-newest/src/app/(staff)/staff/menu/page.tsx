'use client';

import { PageContainer } from '@/components/layout';
import { StaffMenuPanel } from '@/features/staff';

export default function StaffMenuManagementPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Menu Availability</h1>
          <p className="mt-1 text-gray-600">
            Staff can mark menu items as available or sold out in real time.
          </p>
        </div>

        <StaffMenuPanel />
      </div>
    </PageContainer>
  );
}