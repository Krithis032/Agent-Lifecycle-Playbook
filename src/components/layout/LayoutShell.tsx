'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';

const authPages = ['/login', '/forgot-password', '/reset-password', '/setup'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  return (
    <>
      <a href="#main" className="skip-nav">Skip to content</a>
      <Nav />
      <div className={isAuthPage ? '' : 'ml-[240px]'}>
        <main id="main" className={`mx-auto px-10 py-8 min-h-[calc(100vh-52px)] ${isAuthPage ? '' : 'max-w-[1100px]'}`}>
          {children}
        </main>
        <footer className={`mx-auto px-10 py-6 border-t border-[var(--border-default)] flex justify-between text-[10px] font-medium text-[var(--text-tertiary)] tracking-wider uppercase ${isAuthPage ? '' : 'max-w-[1100px]'}`}>
          <span>&copy; 2026 Padmasani Srimadhan. All rights reserved.</span>
          <span>Agent Deployment Playbook v1.0</span>
        </footer>
      </div>
    </>
  );
}
