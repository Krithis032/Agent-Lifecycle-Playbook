'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200 mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <p className="text-[14px] text-[var(--text-2)]">
          Invalid reset link. The link may have expired or been used already.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-[13px] font-semibold text-[var(--accent)] hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[14px] text-[var(--text-2)] font-medium">
          Password reset successfully!
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
        />
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          required
          minLength={8}
          className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-[400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
            Reset Password
          </h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1">
            Enter your new password
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          <Suspense fallback={<div className="text-center text-[var(--text-3)]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-[13px] font-semibold text-[var(--accent)] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
