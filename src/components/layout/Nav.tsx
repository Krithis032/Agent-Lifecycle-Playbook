'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home, BookOpen, FolderKanban, FileText, FolderOpen, ClipboardList,
  Shield, Award, BarChart3,
  BrainCircuit, MessageSquare, BookMarked,
  Settings, LogOut
} from 'lucide-react';

const navSections = [
  {
    label: 'BUILD',
    items: [
      { label: 'Playbook', href: '/playbook', icon: BookOpen },
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'Templates', href: '/templates', icon: FileText },
      { label: 'Documents', href: '/documents', icon: FolderOpen },
      { label: 'My Documents', href: '/my-documents', icon: ClipboardList },
    ],
  },
  {
    label: 'ASSESS',
    items: [
      { label: 'Governance', href: '/governance', icon: Shield },
      { label: 'CAIO', href: '/caio', icon: Award },
      { label: 'Evaluate', href: '/evaluate', icon: BarChart3 },
    ],
  },
  {
    label: 'EXPLORE',
    items: [
      { label: 'Advisor', href: '/advisor', icon: BrainCircuit },
      { label: 'Interview', href: '/interview', icon: MessageSquare },
      { label: 'User Guide', href: '/user-guide', icon: BookMarked },
    ],
  },
];

const authPages = ['/login', '/forgot-password', '/reset-password', '/setup'];

export default function Nav() {
  const pathname = usePathname();

  if (authPages.includes(pathname)) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[240px] flex flex-col z-50"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-divider)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 h-[56px] flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-divider)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--sidebar-accent)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: 'var(--sidebar-accent)' }}
            />
          </span>
          <span
            className="text-[18px] font-bold"
            style={{ color: 'var(--sidebar-text-active)' }}
          >
            ADP
          </span>
        </Link>
      </div>

      {/* Home link */}
      <div className="px-2 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-2.5 mx-2 text-[13px] font-medium transition-all duration-200"
          style={{
            borderRadius: 'var(--radius-md)',
            color: isActive('/') ? 'var(--sidebar-accent)' : 'var(--sidebar-text)',
            background: isActive('/') ? 'var(--sidebar-surface)' : 'transparent',
            borderLeft: isActive('/') ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
            fontWeight: isActive('/') ? 600 : 500,
          }}
        >
          <Home size={16} className="shrink-0" />
          <span>Home</span>
        </Link>
      </div>

      {/* Grouped nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {navSections.map((section) => (
          <div key={section.label}>
            {/* Section eyebrow label */}
            <div
              className="px-4 pt-6 pb-2 text-[11px] font-extrabold tracking-[2px] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              {section.label}
            </div>

            {/* Section items */}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-4 py-2.5 mx-2 text-[13px] font-medium transition-all duration-200"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      color: active ? 'var(--sidebar-accent)' : 'var(--sidebar-text)',
                      background: active ? 'var(--sidebar-surface)' : 'transparent',
                      borderLeft: active ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--sidebar-text-active)';
                        e.currentTarget.style.background = 'var(--sidebar-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--sidebar-text)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section: Settings + Sign Out */}
      <div
        className="px-2 pb-4 pt-2 shrink-0"
        style={{ borderTop: '1px solid var(--sidebar-divider)' }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-4 py-2.5 mx-2 text-[13px] font-medium transition-all duration-200"
          style={{
            borderRadius: 'var(--radius-md)',
            color: isActive('/settings') ? 'var(--sidebar-accent)' : 'var(--sidebar-text)',
            background: isActive('/settings') ? 'var(--sidebar-surface)' : 'transparent',
            borderLeft: isActive('/settings') ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
            fontWeight: isActive('/settings') ? 600 : 500,
          }}
          onMouseEnter={(e) => {
            if (!isActive('/settings')) {
              e.currentTarget.style.color = 'var(--sidebar-text-active)';
              e.currentTarget.style.background = 'var(--sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/settings')) {
              e.currentTarget.style.color = 'var(--sidebar-text)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Settings size={16} className="shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 mx-2 text-[13px] font-medium transition-all duration-200"
          style={{
            borderRadius: 'var(--radius-md)',
            color: 'var(--sidebar-text)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--status-error)';
            e.currentTarget.style.background = 'var(--sidebar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--sidebar-text)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
