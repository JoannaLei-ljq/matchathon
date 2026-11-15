'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Window } from '@/components/Window';
import { Avatar, ErrorNote, PageHeader } from '@/components/ui';
import { INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS, TagInput } from '@/components/TagInput';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth();
  // AppShell only renders this page once the user is loaded.
  return user ? <ProfileForm user={user} onSaved={refresh} logout={logout} /> : null;
}

function ProfileForm({ user, onSaved, logout }: { user: User; onSaved: () => Promise<void>; logout: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    school: user.school,
    location: user.location,
    bio: user.bio,
    linkedin: user.linkedin,
  });
  const [skills, setSkills] = useState(user.skills);
  const [interests, setInterests] = useState(user.interests);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: '' }));
    setSaved(false);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim()) {
      setErrors({ firstName: 'Enter your first name.' });
      return;
    }
    setBusy(true);
    try {
      await api('/users/me', { method: 'PATCH', body: { ...form, skills, interests } });
      await onSaved();
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.fieldErrors);
      setError(err instanceof ApiError ? err.message : 'Couldn’t save your profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader path="profile" title="Profile">
        <button
          type="button"
          className="btn btn-secondary px-3 py-1.5 text-sm lg:hidden"
          onClick={() => {
            logout();
            router.replace('/');
          }}
        >
          Log out
        </button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Window title="preview.png" tone="mocha" as="aside" className="h-fit -rotate-1" bodyClassName="flex flex-col items-center p-6 text-center">
            <Avatar person={{ ...user, ...form }} size={110} frame />
            <h2 className="mt-3 text-xl leading-tight font-display font-extrabold tracking-tight">
              {form.firstName || 'You'} {form.lastName}
            </h2>
            <p className="text-xs text-mocha-muted">{form.school}</p>
            <p className="mt-3 text-sm leading-relaxed">{form.bio || <span className="text-mocha-muted">Add a short bio so people know you.</span>}</p>
          </Window>
          <p className="note-paper rotate-2 self-center px-4 py-2 text-sm">this is how others see you ♥</p>
        </div>

        <Window title="profile.cfg" icon="card" bodyClassName="">
          <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5 sm:p-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="firstName" label="First name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
              <Input id="lastName" label="Last name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
              <Input id="school" label="School or company" value={form.school} onChange={set('school')} error={errors.school} />
              <Input id="location" label="Location" value={form.location} onChange={set('location')} error={errors.location} placeholder="Los Angeles, CA" />
            </div>
            <div>
              <label htmlFor="bio" className="label">
                Bio
              </label>
              <textarea id="bio" rows={3} maxLength={500} className="field resize-y" value={form.bio} onChange={set('bio')} placeholder="Backend person who loves clean data models." />
              <p className="mt-1 text-right text-xs text-mocha-muted">{form.bio.length}/500</p>
            </div>
            <Input id="linkedin" label="LinkedIn URL" type="url" value={form.linkedin} onChange={set('linkedin')} error={errors.linkedin} placeholder="https://linkedin.com/in/you" />
            <TagInput label="Skills you bring" value={skills} onChange={(v) => (setSkills(v), setSaved(false))} suggestions={SKILL_SUGGESTIONS} placeholder="Type a skill and press Enter" />
            <TagInput label="Things you care about" value={interests} onChange={(v) => (setInterests(v), setSaved(false))} suggestions={INTEREST_SUGGESTIONS} tone="lemon" placeholder="Type an interest and press Enter" />

            <ErrorNote message={error} />
            <div className="flex items-center justify-end gap-3 border-t-2 border-dashed border-mocha/30 pt-4">
              {saved && (
                <span className="text-xs font-bold text-matcha" role="status">
                  saved ✓
                </span>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Window>
      </div>
    </>
  );
}

function Input({ id, label, error, ...props }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className={`field ${error ? 'border-berry' : ''}`} aria-invalid={Boolean(error)} {...props} />
      {error && <p className="mt-1 text-sm font-semibold text-berry">{error}</p>}
    </div>
  );
}
