import Link from 'next/link';
import { Pixel } from './Pixel';
import { Window } from './Window';

export function Logo({ size = 'md', href = '/' }: { size?: 'md' | 'lg'; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <Pixel sprite="cup" scale={size === 'lg' ? 3 : 2} />
      <span className={`font-pixel ${size === 'lg' ? 'text-2xl' : 'text-base'} leading-none`}>Matchathon</span>
    </Link>
  );
}

const avatarTints = ['bg-matcha text-foam-light', 'bg-mocha text-foam-light', 'bg-lemon text-mocha', 'bg-matcha-soft text-matcha-dark'];

/** Square "photo" with a pixel font monogram. */
export function Avatar({
  person,
  size = 48,
  frame = false,
}: {
  person: { _id?: string; firstName: string; lastName?: string };
  size?: number;
  frame?: boolean;
}) {
  const initials = `${person.firstName[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase();
  const seed = [...(person._id ?? person.firstName)].reduce((n, c) => n + c.charCodeAt(0), 0);
  const tile = (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className={`inline-flex shrink-0 items-center justify-center border-2 border-mocha font-display font-extrabold ${avatarTints[seed % avatarTints.length]}`}
    >
      {initials}
    </span>
  );
  if (!frame) return tile;
  // Polaroid-ish frame for big profile shots.
  return <span className="inline-block shrink-0 bg-foam-light p-2 pb-6 shadow-[3px_3px_0_0_rgb(90_70_54/0.35)] ring-2 ring-mocha">{tile}</span>;
}

export function Tag({ children, tone = 'matcha' }: { children: React.ReactNode; tone?: 'matcha' | 'lemon' | 'outline' }) {
  const tones = {
    matcha: 'bg-matcha-soft text-matcha-dark',
    lemon: 'bg-lemon text-mocha border-mocha',
    outline: 'bg-foam-light text-mocha border-mocha/50',
  };
  return <span className={`chip ${tones[tone]}`}>{children}</span>;
}

export function Hand({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-sm italic leading-tight ${className}`}>{children}</span>;
}

/** Pixel-font path line, like a file explorer address bar, above the page title. */
export function PageHeader({ path, title, children }: { path: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs text-matcha-dark">C:\matchathon\{path}&gt;</p>
        <h1 className="mt-1 inline-block bg-foam-light/85 px-2 text-2xl font-display font-extrabold leading-snug tracking-tight ring-2 ring-mocha sm:text-3xl">
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
  file = 'notice.txt',
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  file?: string;
}) {
  return (
    <Window title={file} className="mx-auto max-w-md animate-pop" bodyClassName="flex flex-col items-center px-6 py-8 text-center">
      <Pixel sprite="cup" scale={5} className="animate-bob" />
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-mocha-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </Window>
  );
}

/** Old-school blocky progress bar. */
export function Spinner({ label = 'loading' }: { label?: string }) {
  return (
    <div role="status" className="mx-auto flex max-w-xs flex-col items-center gap-3 py-16">
      <Pixel sprite="cup" scale={4} className="animate-bob" />
      <div className="h-5 w-56 border-2 border-mocha bg-foam-light p-0.5">
        <div className="h-full w-full animate-progress bg-[repeating-linear-gradient(90deg,var(--color-matcha)_0_10px,transparent_10px_13px)]" />
      </div>
      <span className="text-xs">
        {label}
        <span className="animate-blink">_</span>
      </span>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 flex items-start gap-2 border-2 border-berry bg-foam-light px-3 py-2 text-sm font-bold text-berry shadow-[2px_2px_0_0_var(--color-berry)]">
      <Pixel sprite="warning" scale={2} className="mt-0.5" />
      {message}
    </p>
  );
}
