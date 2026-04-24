'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      const res = await fetch(`/api/templates/fills/${fillId}`, { method: 'DELETE' });
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
          className="px-3 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-50"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--text-3)] text-[var(--text-3)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-red-400 hover:text-red-600 flex items-center gap-1.5 text-[var(--text-3)] transition-colors"
      title="Delete this document"
    >
      <Trash2 size={14} />
    </button>
  );
}
