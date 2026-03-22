'use client';

import { RolePanelShell } from '@/components/layout/RolePanelShell';
import { GoogleMapsProvider } from '@/lib/GoogleMapsProvider';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RolePanelShell
      role="DRIVER"
      homeHref="/jobs"
      panelTitle="Driver Management"
      navItems={[
        { href: '/jobs', label: 'My Jobs' },
      ]}
    >
      <GoogleMapsProvider>
        {children}
      </GoogleMapsProvider>
    </RolePanelShell>
  );
}
