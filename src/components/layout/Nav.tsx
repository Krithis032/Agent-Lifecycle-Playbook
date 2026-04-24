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
  { label: 'My Documents', href: '/my-documents', icon: FolderOpen },
  { label: 'File Uploads', href: '/documents', icon: FolderOpen },
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
    <aside className="nav-dark fixed top-0 left-0 h-screen w-[220px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50 font-sans">
      {/* Logo */}
      <div className="px-5 h-[56px] flex items-center shrink-0 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center animate-pulse-glow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-[var(--text)] tracking-tight">
            ADP
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-[8px] rounded-[var(--radius-sm)] text-[12.5px] font-medium transition-all duration-200 group ${
                  active
                    ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon size={15} className={`shrink-0 transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-4)] group-hover:text-[var(--text-3)]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign Out at bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--border)] shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2.5 w-full px-3 py-[8px] rounded-[var(--radius-sm)] text-[12.5px] font-medium text-[var(--text-4)] hover:text-[var(--error)] hover:bg-[var(--error-soft)] transition-all duration-200"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
