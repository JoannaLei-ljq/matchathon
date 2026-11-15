'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { HackathonPicker } from '@/components/HackathonPicker';
import { MatchCard } from '@/components/MatchCard';
import { EmptyState, ErrorNote, PageHeader, Spinner } from '@/components/ui';
import { Pixel } from '@/components/Pixel';
import { Window } from '@/components/Window';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { NextMatch, PublicProfile, SwipeResult } from '@/lib/types';
import { useSelectedHackathon } from '@/lib/useSelectedHackathon';

type Celebration = { person: PublicProfile; result: SwipeResult };

const celebrationText: Record<string, string> = {
  team_created: 'You’re now a team of two.',
  joined_team: 'You’re on the same team now.',
  already_teammates: 'You’re already teammates.',
  on_different_teams: 'You’re both on different teams already, so we didn’t merge them.',
  team_full: 'Their team filled up just before you, so you couldn’t join it.',
};

export default function MatchPage() {
  const { user } = useAuth();
  const { selected, select, options } = useSelectedHackathon(user?.hackathons ?? []);
  const [match, setMatch] = useState<NextMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState<'like' | 'pass' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const hackathonId = selected?._id;

  const loadNext = useCallback(async () => {
    if (!hackathonId) return;
    setError(null);
    try {
      setMatch(await api<NextMatch>(`/matches/next?hackathon=${hackathonId}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t load your next match.');
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadNext();
  }, [loadNext]);

  async function swipe(action: 'like' | 'pass') {
    if (!match?.candidate || !hackathonId || busy) return;
    const person = match.candidate;
    setBusy(true);
    setLeaving(action);
    try {
      const result = await api<SwipeResult>('/matches/swipe', {
        method: 'POST',
        body: { hackathon: hackathonId, userId: person._id, action },
      });
      if (result.mutual) setCelebration({ person, result });
      await new Promise((r) => setTimeout(r, 220));
      await loadNext();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t go through. Try again.');
    } finally {
      setLeaving(null);
      setBusy(false);
    }
  }

  // Arrow keys: ← pass, → like.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]');
      if (celebration || typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') swipe('pass');
      if (e.key === 'ArrowRight') swipe('like');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!selected) {
    return (
      <>
        <PageHeader path="match" title="MatchaGround" />
        <EmptyState
          file="no_hackathon.txt"
          title="Pick a hackathon first"
          body="Matching happens within a hackathon. Join one and we’ll start pouring."
          action={
            <Link href="/hackathons" className="btn btn-primary">
              Browse hackathons
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader path="match" title="MatchaGround">
        <HackathonPicker options={options} selected={selected} onSelect={select} />
      </PageHeader>

      <ErrorNote message={error} />

      {loading ? (
        <Spinner label="whisking up a match" />
      ) : match?.candidate ? (
        <div className="mx-auto max-w-2xl">
          <div
            key={match.candidate._id}
            className={`animate-pop transition duration-200 ${
              leaving === 'like' ? 'translate-x-16 rotate-3 opacity-0' : leaving === 'pass' ? '-translate-x-16 -rotate-3 opacity-0' : ''
            }`}
          >
            <MatchCard match={match as NextMatch & { candidate: PublicProfile }} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => swipe('pass')}
              disabled={busy}
              className="btn btn-secondary min-w-32 py-3"
              aria-label={`Pass on ${match.candidate.firstName}`}
              title="Pass (←)"
            >
              <X size={18} strokeWidth={3} /> Pass
            </button>
            <button
              onClick={() => swipe('like')}
              disabled={busy}
              className="btn btn-primary min-w-32 py-3"
              aria-label={`Like ${match.candidate.firstName}`}
              title="Like (→)"
            >
              <Heart size={18} strokeWidth={3} /> Like
            </button>
          </div>
          <p className="mt-4 text-center text-xs">
            <span className="bg-foam-light/80 px-2 py-0.5">
            {match.remaining ? `${match.remaining} more ${match.remaining === 1 ? 'person' : 'people'} brewing` : 'Last one for now'} ·
            use ← and → keys
            </span>
          </p>
        </div>
      ) : match?.status === 'team_full' ? (
        <EmptyState
          file="team_full.txt"
          title="Your team is full"
          body="Four is the perfect cup. Go meet your teammates."
          action={
            <Link href="/team" className="btn btn-primary">
              See your team
            </Link>
          }
        />
      ) : (
        <EmptyState
          file="queue_empty.txt"
          title="That’s everyone for now"
          body="You’ve seen everyone at this hackathon. Check back as more people join."
          action={
            <Link href="/team" className="btn btn-secondary">
              See your matches
            </Link>
          }
        />
      )}

      {celebration && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-mocha/40 p-4" onClick={() => setCelebration(null)}>
          <Window
            title="System Alert"
            tone="lemon"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="celebrate-title"
            className="w-full max-w-sm animate-pop"
            bodyClassName="p-5"
            onClose={() => setCelebration(null)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4">
              <Pixel sprite="heart" scale={5} />
              <div>
                <h2 id="celebrate-title" className="text-lg leading-tight font-display font-extrabold tracking-tight">
                  It’s a match!
                </h2>
                <p className="mt-1 text-sm">
                  You and {celebration.person.firstName} liked each other.{' '}
                  {celebrationText[celebration.result.status ?? ''] ?? ''}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn btn-secondary px-3 py-1.5 text-sm" onClick={() => setCelebration(null)} autoFocus>
                Keep brewing
              </button>
              <Link href="/team" className="btn btn-primary px-3 py-1.5 text-sm" onClick={() => setCelebration(null)}>
                See team ▸
              </Link>
            </div>
          </Window>
        </div>
      )}
    </>
  );
}
