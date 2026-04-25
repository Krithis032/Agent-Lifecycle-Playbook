'use client';

export default function CaioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--status-error-soft)' }}>
        <span className="text-lg font-bold" style={{ color: 'var(--status-error)' }}>!</span>
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Failed to load CAIO data</h2>
      <p className="text-sm max-w-md text-center" style={{ color: 'var(--text-tertiary)' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
        style={{ background: 'var(--module-caio)' }}
      >
        Try again
      </button>
    </div>
  );
}
