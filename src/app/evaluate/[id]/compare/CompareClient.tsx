'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { calculateEvalWeightedScores } from '@/lib/scoring';
import ComparisonView from '@/components/evaluate/ComparisonView';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';
import { ArrowLeft } from 'lucide-react';

interface Evaluation {
  id: number;
  title: string;
  options: unknown;
  criteria: unknown;
  scores: unknown;
}

export default function CompareClient({ id }: { id: string }) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const evalId = parseInt(id, 10);
    if (isNaN(evalId)) {
      setNotFoundError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/evaluate/${evalId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setEvaluation(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch evaluation:', err);
        setNotFoundError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="h-96 bg-[var(--surface-1)] rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  if (notFoundError || !evaluation) {
    notFound();
  }

  const options = evaluation.options as unknown as EvalOption[];
  const criteria = evaluation.criteria as unknown as EvalCriterion[];
  const scores = evaluation.scores as unknown as EvalScore[];
  const results = calculateEvalWeightedScores(options, criteria, scores);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/evaluate/${id}`} className="text-[13px] flex items-center gap-1 mb-3" style={{ color: 'var(--module-evaluate)' }}>
          <ArrowLeft size={14} /> Back to Evaluation
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Side-by-Side Comparison
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{evaluation.title}</p>
      </div>
      <ComparisonView results={results} criteria={criteria} scores={scores} />
    </div>
  );
}
