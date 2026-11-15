import type { Metadata } from 'next';
import { Bricolage_Grotesque, Silkscreen, Space_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const spaceMono = Space_Mono({ variable: '--font-space-mono', weight: ['400', '700'], subsets: ['latin'] });
const bricolage = Bricolage_Grotesque({ variable: '--font-bricolage', subsets: ['latin'] });
const silkscreen = Silkscreen({ variable: '--font-silkscreen', weight: ['400', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Matchathon', template: '%s · Matchathon' },
  description: 'Find hackathon teammates who share your interests and bring the skills your team is missing.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${silkscreen.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
