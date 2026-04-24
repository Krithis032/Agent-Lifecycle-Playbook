'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, BookMarked, FolderKanban, BrainCircuit, Shield,
  Award, BarChart3, FileText, MessageSquare, FolderOpen
} from 'lucide-react';

const sidebarItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Playbook', href: '/playbook', icon: BookOpen },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Advisor', href: '/advisor', icon: BrainCircuit },
  { label: 'Governance', href: '/governance', icon: Shield },
  { label: 'CAIO', href: '/caio', icon: Award },
  { label: 'Evaluate', href: '/evaluate', icon: BarChart3 },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'My Documents', href: '/my-documents', icon: FolderOpen },
  { label: 'User Guide', href: '/user-guide', icon: BookMarked },
  { label: 'Interview', href: '/interview', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen border-r border-[var(--border)] bg-[var(--surface)] p-4 gap-0.5">
      <div className="flex items-center gap-2.5 px-3 py-4 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center animate-pulse-glow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-[14px] font-bold text-[var(--text)] tracking-tight">
          Agent Deployment Playbook
        </span>
      </div>
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-[8px] rounded-[var(--radius-sm)] text-[13px] font-medium transition-all duration-200 group ${
              active
                ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon size={16} className={`shrink-0 transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-4)] group-hover:text-[var(--text-3)]'}`} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
