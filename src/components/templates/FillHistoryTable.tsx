'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Download, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

interface FillRow {
  id: number;
  title: string;
  projectName: string | null;
  updatedAt: string;
  templateName?: string;
  templateSlug?: string;
}

interface FillHistoryTableProps {
  fills: FillRow[];
  templateSlug?: string; // If provided, we're on a template-specific page
  showTemplateName?: boolean;
}

export default function FillHistoryTable({ fills, templateSlug, showTemplateName }: FillHistoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return fills;
    const q = search.toLowerCase();
    return fills.filter(
      f =>
        f.title.toLowerCase().includes(q) ||
        f.projectName?.toLowerCase().includes(q) ||
        f.templateName?.toLowerCase().includes(q)
    );
  }, [fills, search]);

  const handleDelete = async (fillId: number) => {
    setDeletingId(fillId);
    try {
      const res = await fetch(`/api/templates/fills/${fillId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Handle silently
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getSlug = (fill: FillRow) => templateSlug || fill.templateSlug || '';

  return (
    <div>
      {/* Search bar */}
      {fills.length > 0 && (
        <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] text-[var(--text)]"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-hover)] text-[var(--text-3)]">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Title</th>
              {showTemplateName && (
                <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Template</th>
              )}
              <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Project</th>
              <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Last Updated</th>
              <th className="px-6 py-3 font-medium border-b border-[var(--border)]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map(fill => (
              <tr key={fill.id} className="hover:bg-[var(--surface)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[var(--text-4)]" />
                    <span className="font-medium text-[var(--text)]">{fill.title}</span>
                  </div>
                </td>
                {showTemplateName && (
                  <td className="px-6 py-4 text-[var(--text-3)]">{fill.templateName || '—'}</td>
                )}
                <td className="px-6 py-4 text-[var(--text-3)]">{fill.projectName || '—'}</td>
                <td className="px-6 py-4 text-[var(--text-3)]">{new Date(fill.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/templates/${getSlug(fill)}/${fill.id}`}
                      className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[13px] font-medium"
                    >
                      View <ArrowRight size={12} />
                    </Link>
                    <Link
                      href={`/templates/${getSlug(fill)}?edit=${fill.id}`}
                      className="text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <a
                      href={`/api/templates/fills/${fill.id}/export`}
                      className="text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
                      title="Download .docx"
                    >
                      <Download size={14} />
                    </a>
                    {confirmDeleteId === fill.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(fill.id)}
                          disabled={deletingId === fill.id}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === fill.id ? <Loader2 size={12} className="animate-spin" /> : 'Delete?'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] text-[var(--text-4)] hover:text-[var(--text-3)]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(fill.id)}
                        className="text-[var(--text-4)] hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && fills.length > 0 && (
              <tr>
                <td colSpan={showTemplateName ? 5 : 4} className="px-6 py-12 text-center text-[var(--text-3)]">
                  <Search size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                  <p className="font-medium">No documents match &quot;{search}&quot;</p>
                </td>
              </tr>
            )}
            {fills.length === 0 && (
              <tr>
                <td colSpan={showTemplateName ? 5 : 4} className="px-6 py-12 text-center text-[var(--text-3)]">
                  <FileText size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                  <p className="font-medium">No documents yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
