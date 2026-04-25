'use client';

export default function GovernanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-12 h-12 rounded-full bg-[var(--error-soft)] flex items-center justify-center">
        <span className="text-[var(--error)] text-lg font-bold">!</span>
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Failed to load governance data</h2>
      <p className="text-sm max-w-md text-center" style={{ color: 'var(--text-tertiary)' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
        style={{ background: 'var(--brand-primary)' }}
      >
        Try again
      </button>
    </div>
  );
}
