'use client';

import { useState, useMemo } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [hoveredViewId, setHoveredViewId] = useState<number | null>(null);
  const [hoveredEditId, setHoveredEditId] = useState<number | null>(null);
  const [hoveredDownloadId, setHoveredDownloadId] = useState<number | null>(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState<number | null>(null);
  const [hoveredDeleteConfirmId, setHoveredDeleteConfirmId] = useState<number | null>(null);
  const [hoveredCancelId, setHoveredCancelId] = useState<number | null>(null);

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
      const res = await fetchWithAuth(`/api/templates/fills/${fillId}`, { method: 'DELETE' });
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
        <div
          className="px-6 py-3 border-b"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--surface-1)'
          }}
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-quaternary)' }}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none"
              style={{
                borderColor: searchFocused ? 'var(--border-focus)' : 'var(--border-default)',
                boxShadow: searchFocused ? '0 0 0 2px var(--brand-soft)' : 'none',
                backgroundColor: 'var(--surface-0)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead
            style={{
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-tertiary)'
            }}
          >
            <tr>
              <th
                className="px-6 py-3 font-medium border-b"
                style={{ borderColor: 'var(--border-default)' }}
              >
                Title
              </th>
              {showTemplateName && (
                <th
                  className="px-6 py-3 font-medium border-b"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  Template
                </th>
              )}
              <th
                className="px-6 py-3 font-medium border-b"
                style={{ borderColor: 'var(--border-default)' }}
              >
                Project
              </th>
              <th
                className="px-6 py-3 font-medium border-b"
                style={{ borderColor: 'var(--border-default)' }}
              >
                Last Updated
              </th>
              <th
                className="px-6 py-3 font-medium border-b"
                style={{ borderColor: 'var(--border-default)' }}
              ></th>
            </tr>
          </thead>
          <tbody
            className="divide-y"
            style={{ borderColor: 'var(--border-default)' }}
          >
            {filtered.map(fill => (
              <tr
                key={fill.id}
                className="transition-colors"
                style={{
                  backgroundColor: hoveredRowId === fill.id ? 'var(--surface-1)' : 'transparent'
                }}
                onMouseEnter={() => setHoveredRowId(fill.id)}
                onMouseLeave={() => setHoveredRowId(null)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={16}
                      style={{ color: 'var(--text-quaternary)' }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {fill.title}
                    </span>
                  </div>
                </td>
                {showTemplateName && (
                  <td
                    className="px-6 py-4"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {fill.templateName || '—'}
                  </td>
                )}
                <td
                  className="px-6 py-4"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {fill.projectName || '—'}
                </td>
                <td
                  className="px-6 py-4"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {new Date(fill.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/templates/${getSlug(fill)}/${fill.id}`}
                      className="flex items-center gap-1 text-[13px] font-medium"
                      style={{
                        color: 'var(--brand-primary)',
                        textDecoration: hoveredViewId === fill.id ? 'underline' : 'none'
                      }}
                      onMouseEnter={() => setHoveredViewId(fill.id)}
                      onMouseLeave={() => setHoveredViewId(null)}
                    >
                      View <ArrowRight size={12} />
                    </Link>
                    <Link
                      href={`/templates/${getSlug(fill)}?edit=${fill.id}`}
                      className="transition-colors"
                      style={{
                        color: hoveredEditId === fill.id ? 'var(--brand-primary)' : 'var(--text-tertiary)'
                      }}
                      title="Edit"
                      onMouseEnter={() => setHoveredEditId(fill.id)}
                      onMouseLeave={() => setHoveredEditId(null)}
                    >
                      <Pencil size={14} />
                    </Link>
                    <a
                      href={`/api/templates/fills/${fill.id}/export`}
                      className="transition-colors"
                      style={{
                        color: hoveredDownloadId === fill.id ? 'var(--brand-primary)' : 'var(--text-tertiary)'
                      }}
                      title="Download .docx"
                      onMouseEnter={() => setHoveredDownloadId(fill.id)}
                      onMouseLeave={() => setHoveredDownloadId(null)}
                    >
                      <Download size={14} />
                    </a>
                    {confirmDeleteId === fill.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(fill.id)}
                          disabled={deletingId === fill.id}
                          className="text-[11px] font-semibold disabled:opacity-50"
                          style={{
                            color: 'var(--error)',
                            opacity: hoveredDeleteConfirmId === fill.id ? 0.8 : 1
                          }}
                          onMouseEnter={() => setHoveredDeleteConfirmId(fill.id)}
                          onMouseLeave={() => setHoveredDeleteConfirmId(null)}
                        >
                          {deletingId === fill.id ? <Loader2 size={12} className="animate-spin" /> : 'Delete?'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px]"
                          style={{
                            color: hoveredCancelId === fill.id ? 'var(--text-tertiary)' : 'var(--text-quaternary)'
                          }}
                          onMouseEnter={() => setHoveredCancelId(fill.id)}
                          onMouseLeave={() => setHoveredCancelId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(fill.id)}
                        className="transition-colors"
                        style={{
                          color: hoveredDeleteId === fill.id ? 'var(--error)' : 'var(--text-quaternary)'
                        }}
                        title="Delete"
                        onMouseEnter={() => setHoveredDeleteId(fill.id)}
                        onMouseLeave={() => setHoveredDeleteId(null)}
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
                <td
                  colSpan={showTemplateName ? 5 : 4}
                  className="px-6 py-12 text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <Search
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: 'var(--text-quaternary)' }}
                  />
                  <p className="font-medium">No documents match &quot;{search}&quot;</p>
                </td>
              </tr>
            )}
            {fills.length === 0 && (
              <tr>
                <td
                  colSpan={showTemplateName ? 5 : 4}
                  className="px-6 py-12 text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <FileText
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: 'var(--text-quaternary)' }}
                  />
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
