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
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen border-r border-[var(--border)] bg-[var(--canvas)] p-4 gap-1">
      <div className="flex items-center gap-2.5 px-3 py-4 mb-2">
        <div className="w-2 h-2 rounded-full bg-[var(--coral)] animate-pulse" />
        <span className="text-[15px] font-bold text-[var(--accent)] tracking-tight">
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
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              active
                ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
