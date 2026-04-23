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
      <h2 className="text-lg font-bold text-[var(--text)]">Failed to load governance data</h2>
      <p className="text-sm text-[var(--text-3)] max-w-md text-center">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
