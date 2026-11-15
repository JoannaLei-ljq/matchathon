'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ExternalLink, Pencil, X } from 'lucide-react';
import { Pixel } from '@/components/Pixel';
import { Window } from '@/components/Window';
import { Avatar, EmptyState, ErrorNote, PageHeader, Spinner, Tag } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Team } from '@/lib/types';

export default function TeamPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const { teams } = await api<{ teams: Team[] }>('/teams');
      setTeams(teams);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t load your teams.');
    }
  }

  useEffect(() => {
    // Fetch once on mount; state is set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <>
      <PageHeader path="team" title="Team" />
      <ErrorNote message={error} />
      {teams === null ? (
        !error && <Spinner label="gathering your crew" />
      ) : teams.length === 0 ? (
        <EmptyState
          file="team.dir"
          title="No team yet"
          body="When you and someone like each other on MatchaGround, you’ll be teamed up here."
          action={
            <Link href="/match" className="btn btn-primary">
              Start matching ▸
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {teams.map((team) => (
            <TeamWindow key={team._id} team={team} meId={user?._id} onChange={load} onError={setError} />
          ))}
        </div>
      )}
    </>
  );
}

function TeamWindow({
  team,
  meId,
  onChange,
  onError,
}: {
  team: Team;
  meId?: string;
  onChange: () => void;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const max = team.hackathon.maxTeamSize;
  const openSeats = Math.max(0, max - team.members.length);
  const skills = [...new Set(team.members.flatMap((m) => m.skills))];

  async function save() {
    try {
      await api(`/teams/${team._id}`, { method: 'PATCH', body: { name } });
      setEditing(false);
      onChange();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Couldn’t rename the team.');
    }
  }

  async function leave() {
    if (!window.confirm(`Leave ${team.name || 'this team'}?${team.members.length <= 2 ? ' A team of two will be dissolved.' : ''}`)) return;
    try {
      await api(`/teams/${team._id}/leave`, { method: 'POST' });
      onChange();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Couldn’t leave the team.');
    }
  }

  return (
    <Window title="team.dir" icon="folder" className="animate-pop" bodyClassName="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-matcha">{team.hackathon.name}</p>
          {editing ? (
            <form
              className="mt-1 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <input
                className="field py-1.5 font-bold"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Matcha Makers"
                autoFocus
                aria-label="Team name"
              />
              <button type="submit" className="btn btn-primary p-2" aria-label="Save name">
                <Check size={16} strokeWidth={3} />
              </button>
              <button type="button" className="btn btn-secondary p-2" aria-label="Cancel" onClick={() => setEditing(false)}>
                <X size={16} strokeWidth={3} />
              </button>
            </form>
          ) : (
            <h2 className="mt-1 flex items-center gap-2 text-2xl leading-tight font-display font-extrabold tracking-tight">
              {team.name || 'unnamed_team'}
              <button onClick={() => setEditing(true)} className="border-2 border-transparent p-1 hover:border-mocha hover:bg-lemon" aria-label="Rename team">
                <Pencil size={14} strokeWidth={2.5} />
              </button>
            </h2>
          )}
          <p className="mt-1 text-xs text-mocha-muted">
            {team.members.length}/{max} members · {openSeats ? `${openSeats} open ${openSeats === 1 ? 'seat' : 'seats'}` : 'full team'}
          </p>
        </div>
        <button onClick={leave} className="btn btn-secondary px-3 py-1 text-xs">
          leave team
        </button>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {team.members.map((m, i) => (
          <li
            key={m._id}
            className={`relative flex gap-3 border-2 border-mocha bg-foam-light p-4 shadow-[3px_3px_0_0_rgb(90_70_54/0.3)] ${i % 2 ? 'rotate-[0.8deg]' : '-rotate-[0.8deg]'}`}
          >
            <span aria-hidden="true" className="tape -top-3 left-1/2 w-16 -translate-x-1/2 rotate-3" />
            <Avatar person={m} size={56} />
            <div className="min-w-0">
              <p className="font-bold">
                {m.firstName} {m.lastName} {m._id === meId && <span className="text-xs font-normal text-matcha">(you)</span>}
              </p>
              <p className="text-xs text-mocha-muted">{m.school}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.skills.slice(0, 4).map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-matcha-deep underline underline-offset-4 hover:bg-lemon">
                  linkedin <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
            </div>
          </li>
        ))}
        {Array.from({ length: openSeats }).map((_, i) => (
          <li key={`open-${i}`}>
            <Link
              href="/match"
              className="flex h-full min-h-28 flex-col items-center justify-center gap-2 border-2 border-dashed border-mocha/50 bg-foam-light/40 p-4 text-center hover:border-mocha hover:bg-lemon/50"
            >
              <Pixel sprite="sparkle" scale={3} />
              <span className="text-sm font-bold">+ find a teammate</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 bg-terminal px-4 py-3 text-[13px] text-phosphor">
        <span className="text-matcha-soft">matcha@os:~$</span> ls skills/
        <p className="mt-1 text-foam">{skills.join('  ') || '(empty)'}</p>
      </div>
    </Window>
  );
}
