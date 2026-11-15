import type { Metadata } from 'next';
import MatchPage from './view';

// Rendered in the browser after the stored login token is checked (see AppShell).
export const instant = false;
export const metadata: Metadata = { title: 'MatchaGround' };

export default function Page() {
  return <MatchPage />;
}
