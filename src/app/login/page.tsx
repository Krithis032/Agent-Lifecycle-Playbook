'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(errorParam === 'CredentialsSignin' ? 'Invalid email or password' : '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-[400px] mx-auto px-4">
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
            Agent Deployment Playbook
          </h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {/* Credentials Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-semibold text-[var(--text-3)]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-3)] text-sm">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
