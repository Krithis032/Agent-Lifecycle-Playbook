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
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
          style={{ background: 'var(--status-error-soft)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Invalid reset link. The link may have expired or been used already.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-[13px] font-semibold hover:underline"
          style={{ color: 'var(--brand-primary)' }}
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
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
          style={{ background: 'var(--status-success-soft)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Password reset successfully!
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all"
          style={{
            background: 'var(--brand-primary)',
            color: 'var(--text-inverse)',
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const inputStyle = {
    border: '1px solid var(--border-default)',
    background: 'var(--canvas)',
    color: 'var(--text-primary)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-focus)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-default)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
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
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div>
        <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          required
          minLength={8}
          className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Reset Password
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Enter your new password
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
          <Suspense fallback={<div className="text-center" style={{ color: 'var(--text-tertiary)' }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
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
