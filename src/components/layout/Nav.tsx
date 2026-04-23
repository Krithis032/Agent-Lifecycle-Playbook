'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home, BookOpen, BookMarked, FolderKanban, BrainCircuit, Shield,
  Award, BarChart3, FileText, MessageSquare, Settings, LogOut, FolderOpen
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Playbook', href: '/playbook', icon: BookOpen },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Advisor', href: '/advisor', icon: BrainCircuit },
  { label: 'Governance', href: '/governance', icon: Shield },
  { label: 'CAIO', href: '/caio', icon: Award },
  { label: 'Evaluate', href: '/evaluate', icon: BarChart3 },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'User Guide', href: '/user-guide', icon: BookMarked },
  { label: 'Interview', href: '/interview', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();

  // Hide nav on auth pages
  if (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password') return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[200px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50 font-sans">
      {/* Logo */}
      <div className="px-4 h-[48px] flex items-center shrink-0 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[15px] font-bold text-[var(--accent)] tracking-tight">
            ADP
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="flex flex-col gap-px">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
                  active
                    ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--accent-glow)]'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign Out at bottom */}
      <div className="px-2 pb-3 pt-1.5 border-t border-[var(--border)] shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[12.5px] font-semibold text-[var(--text-3)] hover:text-[var(--error)] hover:bg-[var(--error-soft)] transition-all duration-200"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
