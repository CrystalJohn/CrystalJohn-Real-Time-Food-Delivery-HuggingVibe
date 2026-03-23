import type { Metadata } from 'next';
import './globals.scss';
import '@/styles/globals.scss';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Food Delivery',
  description: 'Food delivery web application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}