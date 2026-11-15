'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard, AuthLink } from '@/components/AuthCard';
import { ErrorNote } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'authed') router.replace('/match');
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/match');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <AuthCard
      file="login.exe"
      active="login"
      title="Welcome back"
      subtitle="Your next teammate is waiting."
      footer={
        <>
          New here? <AuthLink href="/signup">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <ErrorNote message={error} />
        <button type="submit" className="btn btn-primary mt-2 py-3" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in ▸'}
        </button>
      </form>
    </AuthCard>
  );
}
