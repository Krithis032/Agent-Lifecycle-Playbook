'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if setup is still needed
  useEffect(() => {
    fetch('/api/setup')
      .then((res) => res.json())
      .then((data) => {
        if (!data.setupRequired) {
          router.replace('/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>Checking setup status...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="w-full max-w-[400px] mx-auto px-4 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
            style={{ background: 'var(--status-success-soft)' }}
          >
            <ShieldCheck size={24} style={{ color: 'var(--status-success)' }} />
          </div>
          <h2 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>Setup Complete</h2>
          <p className="text-[13px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Admin account created. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
      <div className="w-full max-w-[440px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] mb-5"
            style={{ background: 'var(--brand-primary)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Initial Setup
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Create your admin account to get started
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
          {/* Security notice */}
          <div
            className="flex items-start gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] mb-6"
            style={{
              background: 'var(--status-info-soft)',
              border: '1px solid rgba(3, 105, 161, 0.15)',
            }}
          >
            <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--status-info)' }} />
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--status-info)' }}>
              This page is only available during first-time setup. Once an admin account is created, this page will be permanently disabled.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="px-3 py-2.5 rounded-[var(--radius-sm)] text-[12px] font-semibold"
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                required
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] text-[14px] transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-[var(--radius-md)] text-[14px] transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
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
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
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
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-tertiary)' }}>
          &copy; 2026 Padmasani Srimadhan. All rights reserved.
        </p>
      </div>
    </div>
  );
}
