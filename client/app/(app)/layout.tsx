import { AppShell } from '@/components/AppShell';

// The logged-in area depends on a token stored in the browser, so the server
// can't prerender it. Opt out of Next's instant-navigation validation here.
export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
