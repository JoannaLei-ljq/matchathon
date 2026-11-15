'use client';

import { useEffect, useState } from 'react';

export type TermLine = { text: string; kind?: 'cmd' | 'ok' | 'dim' };

/** Prints lines one by one like a terminal, then loops. */
export function Terminal({ lines, speed = 650, className = '' }: { lines: TermLine[]; speed?: number; className?: string }) {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setShown((n) => (n >= lines.length + 3 ? 1 : n + 1)), speed);
    return () => clearInterval(id);
  }, [lines.length, speed]);

  return (
    <div className={`bg-terminal p-3 text-[12px] leading-relaxed text-phosphor sm:text-[13px] ${className}`} aria-label="Terminal demo">
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className={l.kind === 'dim' ? 'opacity-60' : l.kind === 'ok' ? 'text-lemon' : ''}>
          {l.kind === 'cmd' && <span className="text-matcha-soft">matcha@os:~$ </span>}
          {l.text}
        </div>
      ))}
      <span className="inline-block h-[1em] w-[0.6em] translate-y-0.5 animate-blink bg-phosphor" />
    </div>
  );
}
