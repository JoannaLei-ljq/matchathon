'use client';

import { useEffect, useState } from 'react';

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Client-only so server and browser HTML match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="w-20" />;
  return (
    <span className="text-right leading-tight">
      <span className="block font-bold">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
      <span className="hidden text-[10px] opacity-80 sm:block">
        {now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    </span>
  );
}

/** Clouds and rolling hills behind the windows. Purely decorative. */
function Scenery() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {[
        { top: '8%', w: 180, delay: '0s', dur: '80s' },
        { top: '22%', w: 120, delay: '-30s', dur: '95s' },
        { top: '4%', w: 90, delay: '-55s', dur: '70s' },
      ].map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 60 20"
          width={c.w}
          className="pixelated absolute left-0 animate-drift opacity-90"
          style={{ top: c.top, animationDelay: c.delay, animationDuration: c.dur }}
        >
          <path d="M8 16h44v-4h-4V8h-6V4H28v4h-6v2h-8v2H8z" fill="#fff" />
        </svg>
      ))}
      <svg viewBox="0 0 1200 260" preserveAspectRatio="none" className="absolute bottom-0 h-[34%] w-full min-w-[700px]">
        <path d="M0 120 Q150 40 330 100 T700 80 T1040 70 T1200 90 V260 H0Z" fill="#a9c98a" />
        <path d="M0 170 Q220 100 460 150 T900 130 T1200 150 V260 H0Z" fill="#8fb26d" />
        <path d="M0 215 Q300 160 620 205 T1200 195 V260 H0Z" fill="#668b4a" />
        {/* little flowers */}
        {Array.from({ length: 28 }).map((_, i) => (
          <circle key={i} cx={(i * 97) % 1200} cy={225 + ((i * 37) % 30)} r={3} fill={i % 3 ? '#fffaf0' : '#e8c15a'} />
        ))}
      </svg>
    </div>
  );
}

/**
 * The "monitor": a framed desktop with wallpaper, a scrolling area for windows,
 * and a taskbar. Sits on grid paper with a couple of tape strips.
 */
export function Desktop({ taskbar, children }: { taskbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative h-dvh p-2 sm:p-4">
      <div className="wallpaper relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-mocha shadow-[6px_6px_0_0_rgb(90_70_54/0.25)]">
        <Scenery />
        <div className="relative flex-1 overflow-y-auto overscroll-contain">{children}</div>
        <div className="relative z-10 flex items-center gap-2 border-t-2 border-matcha-dark bg-matcha-deep px-2 py-1.5 text-foam sm:gap-3 sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2">{taskbar}</div>
          <Clock />
        </div>
      </div>
      <span aria-hidden="true" className="tape -left-3 top-1 hidden -rotate-12 sm:block" />
      <span aria-hidden="true" className="tape -right-3 bottom-10 hidden rotate-[20deg] sm:block" />
    </div>
  );
}

/** A taskbar button: pill when active, plain text otherwise. */
export function TaskbarItem({
  active,
  children,
  className = '',
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold transition ${
        active ? 'bg-foam text-matcha-deep shadow-[2px_2px_0_0_var(--color-matcha-dark)]' : 'hover:bg-matcha'
      } ${className}`}
    >
      {children}
    </span>
  );
}
