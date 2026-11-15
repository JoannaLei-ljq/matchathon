import type { Metadata } from 'next';
import TeamPage from './view';

// Rendered in the browser after the stored login token is checked (see AppShell).
export const instant = false;
export const metadata: Metadata = { title: 'Team' };

export default function Page() {
  return <TeamPage />;
}
