'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Countdown } from '@/components/Countdown';
import { Pixel } from '@/components/Pixel';
import { Window } from '@/components/Window';
import { EmptyState, ErrorNote, PageHeader, Spinner } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Hackathon } from '@/lib/types';

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function dateRange(h: Hackathon) {
  const end = new Date(h.endsAt);
  return `${dateFmt.format(new Date(h.startsAt))} – ${dateFmt.format(end)}, ${end.getFullYear()}`;
}

export default function HackathonsPage() {
  const { user, refresh } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const joined = new Set(user?.hackathons.map((h) => h._id));

  async function load() {
    try {
      const { hackathons } = await api<{ hackathons: Hackathon[] }>('/hackathons');
      setHackathons(hackathons);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t load hackathons.');
    }
  }

  useEffect(() => {
    // Fetch once on mount; state is set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function toggle(h: Hackathon) {
    setPending(h._id);
    setError(null);
    try {
      await api(`/hackathons/${h._id}/join`, { method: joined.has(h._id) ? 'DELETE' : 'POST' });
      await Promise.all([refresh(), load()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t go through. Try again.');
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <PageHeader path="hackathons" title="Hackathons" />
      <ErrorNote message={error} />

      {hackathons === null ? (
        !error && <Spinner label="fetching events" />
      ) : hackathons.length === 0 ? (
        <EmptyState file="events.txt" title="No hackathons yet" body="When organizers add events, they’ll show up here." />
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
          {hackathons.map((h, i) => {
            const isIn = joined.has(h._id);
            return (
              <li key={h._id} className="min-w-0 animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
                <Window
                  title={`${h.slug}.evt`}
                  icon="calendar"
                  tone={isIn ? 'matcha' : 'mocha'}
                  as="article"
                  className={`h-full ${i % 2 ? 'md:rotate-[0.6deg]' : 'md:-rotate-[0.6deg]'}`}
                  bodyClassName="flex h-[calc(100%-29px)] flex-col gap-4 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex w-16 shrink-0 flex-col items-center border-2 border-mocha bg-foam-light">
                      <span className="w-full bg-berry py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-foam">
                        {new Date(h.startsAt).toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="py-1 text-2xl font-bold">{new Date(h.startsAt).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="break-words text-xl leading-tight font-display font-extrabold tracking-tight">{h.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-mocha-muted">
                        {dateRange(h)}
                        {h.location && ` · ${h.location}`}
                        <br />
                        {h.attendeeCount ?? 0} going · teams of {h.maxTeamSize}
                      </p>
                      {isIn && <span className="chip mt-2 bg-lemon">joined ✓</span>}
                    </div>
                  </div>
                  {h.description && <p className="text-sm">{h.description}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <Countdown startsAt={h.startsAt} endsAt={h.endsAt} />
                    <div className="flex gap-2">
                      {isIn && (
                        <Link href="/match" className="btn btn-primary px-3 py-1.5 text-sm">
                          <Pixel sprite="heart" scale={1.5} /> Match
                        </Link>
                      )}
                      <button
                        onClick={() => toggle(h)}
                        disabled={pending === h._id}
                        className={`btn px-3 py-1.5 text-sm ${isIn ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {pending === h._id ? '…' : isIn ? 'Leave' : 'Join ▸'}
                      </button>
                    </div>
                  </div>
                </Window>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
