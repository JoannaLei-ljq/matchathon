'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Desktop, TaskbarItem } from './Desktop';
import { Pixel, type SpriteName } from './Pixel';
import { Spinner } from './ui';

const NAV: { href: string; label: string; short: string; icon: SpriteName }[] = [
  { href: '/match', label: 'MatchaGround', short: 'Match', icon: 'heart' },
  { href: '/hackathons', label: 'Hackathons', short: 'Hacks', icon: 'calendar' },
  { href: '/team', label: 'Team', short: 'Team', icon: 'team' },
  { href: '/profile', label: 'Profile', short: 'Me', icon: 'card' },
];

/** The logged-in desktop: icons on the left, windows in the middle, taskbar below. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'guest') router.replace('/login');
  }, [status, router]);

  const taskbar = (
    <>
      <Link href="/" className="mr-1 hidden items-center gap-1.5 rounded-full bg-foam px-2.5 py-1 font-pixel text-[11px] text-matcha-deep sm:inline-flex">
        <Pixel sprite="cup" scale={1} /> start
      </Link>
      {NAV.map(({ href, label, short }) => (
        <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined}>
          <TaskbarItem active={pathname.startsWith(href)}>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </TaskbarItem>
        </Link>
      ))}
    </>
  );

  if (status !== 'authed' || !user) {
    return (
      <Desktop taskbar={taskbar}>
        <Spinner label="booting matchaOS" />
      </Desktop>
    );
  }

  return (
    <Desktop taskbar={taskbar}>
      <div className="flex min-h-full gap-6 px-3 py-5 sm:px-6 sm:py-6">
        <nav aria-label="Desktop" className="sticky top-0 hidden w-20 shrink-0 flex-col items-center gap-5 lg:flex">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="group flex w-20 flex-col items-center gap-1 text-center">
                <span className={`grid h-14 w-14 place-items-center border-2 ${active ? 'border-mocha bg-lemon/80' : 'border-transparent group-hover:border-mocha/40 group-hover:bg-foam-light/60'}`}>
                  <Pixel sprite={icon} scale={4} />
                </span>
                <span className={`px-1 text-[11px] font-bold leading-tight ${active ? 'bg-matcha text-foam' : 'bg-foam-light/80'}`}>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              router.replace('/');
            }}
            className="group mt-2 flex w-20 flex-col items-center gap-1 text-center"
          >
            <span className="grid h-14 w-14 place-items-center border-2 border-transparent group-hover:border-mocha/40 group-hover:bg-foam-light/60">
              <LogOut size={28} strokeWidth={2.5} />
            </span>
            <span className="bg-foam-light/80 px-1 text-[11px] font-bold">log_out</span>
          </button>
        </nav>

        <main className="mx-auto w-full min-w-0 max-w-4xl pb-10">{children}</main>
      </div>
    </Desktop>
  );
}
