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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
      <div className="w-full max-w-[400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] mb-5"
            style={{ background: 'var(--brand-primary)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Forgot Password
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
            {sent
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[var(--radius-lg)] p-7"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {sent ? (
            <div className="text-center space-y-4">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
                style={{ background: 'var(--status-success-soft)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset email shortly.
              </p>
              <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-[13px] font-semibold hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="px-3 py-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium"
                  style={{
                    background: 'var(--status-error-soft)',
                    color: 'var(--status-error)',
                    border: '1px solid rgba(220, 38, 38, 0.15)',
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all"
                  style={{
                    border: '1px solid var(--border-default)',
                    background: 'var(--canvas)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--brand-primary)',
                  color: 'var(--text-inverse)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--brand-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary)';
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-[13px] font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
