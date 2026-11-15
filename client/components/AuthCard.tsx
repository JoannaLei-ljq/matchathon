'use client';

import Link from 'next/link';
import { Desktop, TaskbarItem } from './Desktop';
import { Pixel } from './Pixel';
import { Window } from './Window';

/** Login / sign-up: a single dialog window on the desktop. */
export function AuthCard({
  file,
  title,
  subtitle,
  children,
  footer,
  active,
}: {
  file: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  active: 'login' | 'signup';
}) {
  const taskbar = (
    <>
      <Link href="/" className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-foam px-2.5 py-1 font-pixel text-[11px] text-matcha-deep">
        <Pixel sprite="cup" scale={1} /> start
      </Link>
      <Link href="/login">
        <TaskbarItem active={active === 'login'}>Log in</TaskbarItem>
      </Link>
      <Link href="/signup">
        <TaskbarItem active={active === 'signup'}>Sign up</TaskbarItem>
      </Link>
    </>
  );

  return (
    <Desktop taskbar={taskbar}>
      <div className="grid min-h-full place-items-center px-3 py-8">
        <div className="relative w-full max-w-md">
          <div className="note-paper absolute -right-24 -top-8 hidden w-40 rotate-6 px-4 py-3 text-sm leading-snug md:block" aria-hidden="true">
            good teams start with a good brew ♥
          </div>
          <Window title={file} icon="cup" className="animate-pop" bodyClassName="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Pixel sprite="cup" scale={3} />
              <div>
                <h1 className="text-xl leading-tight sm:text-2xl font-display font-extrabold tracking-tight">{title}</h1>
                <p className="text-sm text-mocha-muted">{subtitle}</p>
              </div>
            </div>
            <div className="mt-6">{children}</div>
            <p className="mt-6 border-t-2 border-dashed border-mocha/30 pt-4 text-center text-sm">{footer}</p>
          </Window>
        </div>
      </div>
    </Desktop>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-bold text-matcha-deep underline decoration-2 underline-offset-4 hover:bg-lemon">
      {children}
    </Link>
  );
}
