import type { Metadata } from 'next';
import HackathonsPage from './view';

// Rendered in the browser after the stored login token is checked (see AppShell).
export const instant = false;
export const metadata: Metadata = { title: 'Hackathons' };

export default function Page() {
  return <HackathonsPage />;
}
