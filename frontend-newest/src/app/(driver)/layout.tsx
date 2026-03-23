'use client';

import { RolePanelShell } from '@/components/layout/RolePanelShell';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RolePanelShell
      role="DRIVER"
      homeHref="/jobs"
      panelTitle="Driver Management"
      navItems={[{ href: '/jobs', label: 'My Jobs' }]}
    >
      {children}
    </RolePanelShell>
  );
}