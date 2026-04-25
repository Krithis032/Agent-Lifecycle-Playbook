'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIAssistButtonProps {
  templateName: string;
  fieldLabel: string;
  fieldHelpText?: string;
  existingValues: Record<string, string>;
  onInsert: (text: string) => void;
}

export default function AIAssistButton({
  templateName,
  fieldLabel,
  fieldHelpText,
  existingValues,
  onInsert,
}: AIAssistButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAssist = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/templates/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, fieldLabel, fieldHelpText, existingValues }),
      });
      const data = await res.json();
      if (data.text) onInsert(data.text);
    } catch (e) {
      console.error('AI assist failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAssist}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#7c3aed] bg-[rgba(139,92,246,0.1)] rounded-md hover:bg-[rgba(139,92,246,0.15)] transition-colors disabled:opacity-50"
      title="AI Assist — generate draft content"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? 'Generating...' : 'AI Assist'}
    </button>
  );
}
