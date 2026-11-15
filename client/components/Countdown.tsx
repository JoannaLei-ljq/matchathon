'use client';

import { useEffect, useState } from 'react';

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60) };
}

/** Terminal-style countdown to a hackathon. */
export function Countdown({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Only tick on the client so server and browser HTML match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const box = 'inline-flex items-center gap-1 bg-terminal px-3 py-2 font-bold text-phosphor';
  if (now === null) return <div className="h-10" />;

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now >= end) return <p className={box}>status: wrapped_up</p>;
  if (now >= start) return <p className={`${box} text-lemon`}>status: live now!</p>;

  const { days, hours, minutes } = parts(start - now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <p className={box} aria-label={`Starts in ${days} days, ${hours} hours and ${minutes} minutes`}>
      <span className="text-lg">{days}</span>
      <span className="text-[10px] opacity-70">d</span>
      <span className="text-lg">{pad(hours)}</span>
      <span className="text-[10px] opacity-70">h</span>
      <span className="text-lg">{pad(minutes)}</span>
      <span className="text-[10px] opacity-70">m</span>
      <span className="animate-blink">_</span>
    </p>
  );
}
