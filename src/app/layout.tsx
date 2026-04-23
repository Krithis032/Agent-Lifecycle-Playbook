import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Agent Deployment Playbook',
  description: 'Personal operational tool for managing AI agent deployments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
