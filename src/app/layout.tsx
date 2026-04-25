import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';
import SessionProvider from '@/components/providers/SessionProvider';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: 'Agent Deployment Playbook',
  description: 'Personal operational tool for managing AI agent deployments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={urbanist.variable}>
      <body className={urbanist.className}>
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
