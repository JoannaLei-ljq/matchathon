import type { Metadata } from 'next';
import ProfilePage from './view';

// Rendered in the browser after the stored login token is checked (see AppShell).
export const instant = false;
export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <ProfilePage />;
}
