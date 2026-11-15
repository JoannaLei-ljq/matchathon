'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthCard, AuthLink } from '@/components/AuthCard';
import { ErrorNote, Hand } from '@/components/ui';
import { INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS, TagInput } from '@/components/TagInput';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function SignupPage() {
  const { status, register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', school: '', email: '', password: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'authed') router.replace('/hackathons');
  }, [status, router]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: '' }));
  };

  function validateStep1() {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }
    if (skills.length === 0 || interests.length === 0) {
      setError('Add at least one skill and one interest so we can find your matches.');
      return;
    }
    setBusy(true);
    try {
      await register({ ...form, skills, interests });
      router.replace('/hackathons');
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.fieldErrors;
        if (fieldErrors.email || fieldErrors.password || fieldErrors.firstName || err.status === 409) {
          setErrors({ ...fieldErrors, ...(err.status === 409 ? { email: err.message } : {}) });
          setStep(1);
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong.');
      }
      setBusy(false);
    }
  }

  return (
    <AuthCard
      file={`new_user.exe ${step}/2`}
      active="signup"
      title={step === 1 ? 'Create your account' : 'What’s your flavor?'}
      subtitle={step === 1 ? 'Takes about a minute.' : 'This is what we use to find your matches.'}
      footer={
        <>
          Already have an account? <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-2" aria-hidden="true">
        <span className={`h-3 flex-1 border-2 border-mocha ${step >= 1 ? 'bg-matcha' : 'bg-foam-light'}`} />
        <span className={`h-3 flex-1 border-2 border-mocha ${step >= 2 ? 'bg-matcha' : 'bg-foam-light'}`} />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="First name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} autoComplete="given-name" />
              <Field id="lastName" label="Last name" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
            </div>
            <Field id="school" label="School or company" value={form.school} onChange={set('school')} placeholder="USC" autoComplete="organization" />
            <Field id="email" label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@school.edu" autoComplete="email" />
            <Field id="password" label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" hint="At least 8 characters." />
          </>
        ) : (
          <>
            <TagInput label="Skills you bring" value={skills} onChange={setSkills} suggestions={SKILL_SUGGESTIONS} placeholder="Type a skill and press Enter" />
            <TagInput label="Things you care about" value={interests} onChange={setInterests} suggestions={INTEREST_SUGGESTIONS} placeholder="Type an interest and press Enter" tone="lemon" />
            <Hand className="text-mocha-muted">tip: we match shared interests with different skills</Hand>
          </>
        )}

        <ErrorNote message={error} />

        <div className="mt-2 flex gap-3">
          {step === 2 && (
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button type="submit" className="btn btn-primary flex-1 py-3" disabled={busy}>
            {step === 1 ? (
              <>
                Continue <ArrowRight size={18} />
              </>
            ) : busy ? (
              'Brewing your profile…'
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  ...input
}: { id: string; label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className={`field ${error ? 'border-berry' : ''}`} aria-invalid={Boolean(error)} aria-describedby={`${id}-msg`} {...input} />
      <p id={`${id}-msg`} className={`mt-1 text-sm ${error ? 'font-semibold text-berry' : 'text-mocha-muted'}`}>
        {error || hint}
      </p>
    </div>
  );
}
