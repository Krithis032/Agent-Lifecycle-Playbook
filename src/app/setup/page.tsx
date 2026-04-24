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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-3)] text-sm">Checking setup status...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-full max-w-[400px] mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-4">
            <ShieldCheck size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">Setup Complete</h2>
          <p className="text-[13px] text-[var(--text-3)] mt-2">
            Admin account created. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-[440px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
            Initial Setup
          </h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1">
            Create your admin account to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {/* Security notice */}
          <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-6">
            <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[12px] text-blue-700 leading-relaxed">
              This page is only available during first-time setup. Once an admin account is created, this page will be permanently disabled.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                required
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
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
                  className="w-full px-3 py-2.5 pr-10 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--text-4)] mt-6">
          &copy; 2026 Padmasani Srimadhan. All rights reserved.
        </p>
      </div>
    </div>
  );
}
