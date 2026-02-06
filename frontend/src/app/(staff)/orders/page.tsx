'use client';

import { TicketQueue } from '@/features/staff';
import { PageContainer } from '@/components/layout';

export default function StaffOrdersPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kitchen Queue</h1>
          <p className="text-gray-600">Manage incoming orders and prepare food</p>
        </div>
        
        <TicketQueue />
      </div>
    </PageContainer>
  );
}
