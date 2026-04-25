'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteFillButtonProps {
  fillId: number;
  templateSlug: string;
}

export default function DeleteFillButton({ fillId, templateSlug }: DeleteFillButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/templates/fills/${fillId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(`/templates/${templateSlug}/fills`);
        router.refresh();
      }
    } catch {
      // Handle error silently
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: 'var(--status-error)' }}
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm font-medium rounded-lg"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
      style={{ border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--status-error)'; e.currentTarget.style.color = 'var(--status-error)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
      title="Delete this document"
    >
      <Trash2 size={14} />
    </button>
  );
}
