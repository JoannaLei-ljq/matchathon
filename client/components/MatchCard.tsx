import { ExternalLink } from 'lucide-react';
import type { NextMatch, PublicProfile } from '@/lib/types';
import { Window } from './Window';
import { Avatar, Tag } from './ui';

/** Blocky 10-segment meter, like an old battery indicator. */
function Meter({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value / 10);
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1 flex gap-0.5" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`h-3 flex-1 border border-phosphor/60 ${i < filled ? 'bg-phosphor' : ''}`} />
        ))}
      </div>
    </div>
  );
}

/** The profile on MatchaGround, as a window with a terminal "why you match" readout. */
export function MatchCard({ match }: { match: NextMatch & { candidate: PublicProfile } }) {
  const { candidate: p } = match;
  const shared = new Set((match.sharedInterests ?? []).map((t) => t.toLowerCase()));
  const fresh = new Set((match.newSkills ?? []).map((t) => t.toLowerCase()));

  return (
    <Window title="match_found.exe" icon="heart" as="article" bodyClassName="">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar person={p} size={120} frame />
          {typeof match.score === 'number' && (
            <span className="chip -mt-1 bg-lemon text-sm">{match.score}% match</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl leading-tight sm:text-3xl font-display font-extrabold tracking-tight">
            {p.firstName} {p.lastName}
          </h2>
          {(p.school || p.location) && <p className="mt-1 text-sm text-mocha-muted">{[p.school, p.location].filter(Boolean).join(' · ')}</p>}
          {p.bio && <p className="mt-3 leading-relaxed">{p.bio}</p>}

          <dl className="mt-4 grid gap-3">
            <div>
              <dt className="label">skills</dt>
              <dd className="flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <Tag key={s} tone={fresh.has(s.toLowerCase()) ? 'matcha' : 'outline'}>
                    {fresh.has(s.toLowerCase()) && '+ '}
                    {s}
                  </Tag>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label">cares about</dt>
              <dd className="flex flex-wrap gap-1.5">
                {p.interests.map((s) => (
                  <Tag key={s} tone={shared.has(s.toLowerCase()) ? 'lemon' : 'outline'}>
                    {shared.has(s.toLowerCase()) && '♥ '}
                    {s}
                  </Tag>
                ))}
              </dd>
            </div>
          </dl>

          {p.linkedin && (
            <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-matcha-deep underline underline-offset-4 hover:bg-lemon">
              linkedin <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {match.reason && (
        <div className="border-t-2 border-matcha-dark bg-terminal px-5 py-4 text-phosphor sm:px-6">
          <p className="text-[13px]">
            <span className="text-matcha-soft">matcha@os:~$</span> cat why_you_match.txt
          </p>
          <p className="mt-1.5 leading-relaxed text-foam">{match.reason}</p>
          {match.breakdown && (
            <div className="mt-4 grid max-w-md grid-cols-2 gap-5">
              <Meter label="shared interests" value={match.breakdown.interests} />
              <Meter label="new skills" value={match.breakdown.skills} />
            </div>
          )}
        </div>
      )}
    </Window>
  );
}
