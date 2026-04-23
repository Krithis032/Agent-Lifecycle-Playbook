'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Forgot Password
          </h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1">
            {sent
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[14px] text-[var(--text-2)] leading-relaxed">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset email shortly.
              </p>
              <p className="text-[12px] text-[var(--text-4)]">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-[13px] font-semibold text-[var(--accent)] hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
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
