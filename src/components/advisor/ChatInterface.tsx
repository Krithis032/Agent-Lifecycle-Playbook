'use client';

import { useState, useRef } from 'react';
import { Send, Search, Loader2 } from 'lucide-react';
import { useAdvisor } from '@/hooks/useAdvisor';
import ConceptCard from './ConceptCard';
import SourceCitation from './SourceCitation';
import Button from '@/components/ui/Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  conceptsCited?: { id: number; name: string; domain: string; source: string }[];
}

export default function ChatInterface() {
  const { searchResults, searching, search, answer, asking, ask } = useAdvisor();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<'search' | 'ask'>('search');
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleInput = (value: string) => {
    setQuery(value);
    if (mode === 'search') {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(value), 300);
    }
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    await ask(query);
  };

  // Update messages when we get an answer
  if (answer && messages.length > 0 && messages[messages.length - 1].role === 'user') {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: answer.answer,
        conceptsCited: answer.conceptsCited,
      },
    ]);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('search')}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: mode === 'search' ? 'var(--brand-soft)' : 'transparent',
            color: mode === 'search' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
          }}
        >
          <Search size={14} className="inline mr-1" /> Search KB
        </button>
        <button
          onClick={() => setMode('ask')}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: mode === 'ask' ? 'var(--brand-soft)' : 'transparent',
            color: mode === 'ask' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
          }}
        >
          <Send size={14} className="inline mr-1" /> Ask Advisor
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 px-4 py-2.5 rounded-lg text-[14px] focus:outline-none"
          style={{
            border: '1px solid var(--border-default)',
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
          placeholder={mode === 'search' ? 'Search concepts...' : 'Ask a question about agentic AI...'}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && mode === 'ask') handleAsk(); }}
        />
        {mode === 'ask' && (
          <Button onClick={handleAsk} disabled={asking || !query.trim()}>
            {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        )}
      </div>

      {mode === 'search' && (
        <div>
          {searching && <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Searching...</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((r) => (
              <ConceptCard
                key={r.id}
                conceptName={r.concept_name}
                definition={r.definition}
                domainName={r.domain_name}
                kbSource={r.kb_source}
                sources={r.sources as string[] | null}
                relevance={r.relevance}
              />
            ))}
          </div>
        </div>
      )}

      {mode === 'ask' && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className="inline-block max-w-[80%] px-4 py-3 rounded-[14px] text-[14px]"
                style={{
                  background: msg.role === 'user' ? 'var(--brand-primary)' : 'var(--surface-elevated)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-default)' : undefined,
                }}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.conceptsCited && msg.conceptsCited.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <SourceCitation concepts={msg.conceptsCited} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {asking && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
