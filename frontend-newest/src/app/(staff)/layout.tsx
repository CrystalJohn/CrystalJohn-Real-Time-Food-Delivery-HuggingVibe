'use client';

import { RolePanelShell } from '@/components/layout/RolePanelShell';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RolePanelShell
      role="STAFF"
      homeHref="/tickets"
      panelTitle="Staff Management"
      navItems={[
        { href: '/tickets', label: 'Kitchen Queue' },
        { href: '/staff/menu', label: 'Menu Availability' },
      ]}
    >
      {children}
    </RolePanelShell>
  );
}