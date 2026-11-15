'use client';

import Link from 'next/link';
import { Desktop, TaskbarItem } from '@/components/Desktop';
import { Pixel } from '@/components/Pixel';
import { Terminal } from '@/components/Terminal';
import { Window } from '@/components/Window';
import { Avatar, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const DEMO = [
  { text: 'brew --team --hackathon athenahacks', kind: 'cmd' as const },
  { text: 'scoring 9 hackers by interests + skills…', kind: 'dim' as const },
  { text: 'top pick: Maya Chen (75%)' },
  { text: '✔ shared: Sustainability, Edtech', kind: 'ok' as const },
  { text: '✔ brings: Swift, iOS, Figma', kind: 'ok' as const },
];

export default function Home() {
  const { status } = useAuth();
  const authed = status === 'authed';

  const taskbar = (
    <>
      <span className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-foam px-2.5 py-1 font-pixel text-[11px] text-matcha-deep">
        <Pixel sprite="cup" scale={1} /> start
      </span>
      {authed ? (
        <Link href="/match">
          <TaskbarItem active>Open MatchaGround</TaskbarItem>
        </Link>
      ) : (
        <>
          <Link href="/login">
            <TaskbarItem>Log in</TaskbarItem>
          </Link>
          <Link href="/signup">
            <TaskbarItem active>Sign up</TaskbarItem>
          </Link>
        </>
      )}
    </>
  );

  return (
    <Desktop taskbar={taskbar}>
      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-6 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[96px_minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* desktop icons */}
        <nav aria-label="Shortcuts" className="hidden flex-col items-center gap-6 xl:flex">
          {[
            { href: authed ? '/match' : '/signup', icon: 'heart' as const, label: 'match.exe' },
            { href: authed ? '/hackathons' : '/login', icon: 'calendar' as const, label: 'hackathons' },
            { href: 'https://github.com/JoannaLei-ljq/matchathon', icon: 'folder' as const, label: 'source' },
          ].map((i) => (
            <Link key={i.label} href={i.href} className="group flex w-20 flex-col items-center gap-1 text-center">
              <span className="grid h-14 w-14 place-items-center border-2 border-transparent group-hover:border-mocha/40 group-hover:bg-foam-light/60">
                <Pixel sprite={i.icon} scale={4} />
              </span>
              <span className="bg-foam-light/80 px-1 text-[11px] font-bold">{i.label}</span>
            </Link>
          ))}
        </nav>

        {/* hero */}
        <Window title="welcome.txt" icon="cup" className="animate-pop self-start" bodyClassName="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-start 2xl:flex-row 2xl:items-center">
            <Pixel sprite="cup" scale={7} className="animate-bob self-center" label="Pixel matcha latte" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-matcha">hackathon teammate finder</p>
              <h1 className="mt-2 text-[clamp(1.8rem,3.6vw,2.9rem)] font-display font-extrabold leading-[1.1] tracking-tight">
                Let innovation <span className="bg-lemon px-1">steep</span> together.
              </h1>
            </div>
          </div>
          <p className="mt-5 max-w-lg leading-relaxed">
            Find people who care about the same things you do, and who bring the skills your team is missing. Like each
            other and you’re teammates.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={authed ? '/match' : '/signup'} className="btn btn-primary px-5 py-2.5">
              {authed ? 'Open MatchaGround' : 'Start brewing'} ▸
            </Link>
            {!authed && (
              <Link href="/login" className="btn btn-secondary px-5 py-2.5">
                I have an account
              </Link>
            )}
          </div>
        </Window>

        <div className="flex flex-col gap-6">
          <Window title="terminal.exe" tone="mocha" className="animate-pop [animation-delay:120ms]" bodyClassName="">
            <Terminal lines={DEMO} className="min-h-44" />
          </Window>

          <Window title="match_found.exe" icon="heart" className="animate-pop rotate-1 [animation-delay:220ms]" bodyClassName="p-4">
            <div className="flex gap-3">
              <Avatar person={{ firstName: 'Alex', lastName: 'Lin' }} size={56} />
              <div className="min-w-0">
                <p className="font-bold">Alex Lin</p>
                <p className="text-xs text-mocha-muted">USC · frontend</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Tag>React</Tag>
                  <Tag>Figma</Tag>
                  <Tag tone="lemon">Edtech</Tag>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 text-xs">
              <span className="btn btn-secondary px-3 py-1">Pass</span>
              <span className="btn btn-primary px-3 py-1">Like ♥</span>
            </div>
          </Window>

          <div className="note-paper relative -rotate-2 self-end px-5 py-4 text-sm leading-relaxed sm:w-64">
            <span className="tape -top-3 left-16 -rotate-6" aria-hidden="true" />
            <p className="font-bold">how it works</p>
            1. add your skills + interests
            <br />
            2. swipe at a hackathon
            <br />
            3. like each other = team!
          </div>
        </div>
      </div>

      <p className="relative pb-6 text-center text-xs">
        <span className="bg-foam-light/80 px-2">Rebuilt from a team project at AthenaHacks 2025.</span>
      </p>
    </Desktop>
  );
}
