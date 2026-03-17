import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Scheduler - AI Email Scheduling Agent',
  description:
    'AI-powered scheduling agent that reads your emails, checks your calendar, and drafts perfect replies. Stop the back-and-forth — let AI handle your scheduling.',
  keywords: [
    'AI scheduling assistant',
    'email scheduling automation',
    'AI calendar management',
    'automatic meeting scheduler',
    'AI email responder',
    'smart scheduling',
    'calendar AI agent',
    'meeting scheduling automation',
    'AI scheduling agent',
    'email scheduling bot',
    'automated meeting booking',
  ],
  authors: [{ name: 'Fergana Labs' }],
  creator: 'Fergana Labs',
  publisher: 'Fergana Labs',
  metadataBase: new URL('https://scheduler.ferganalabs.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scheduler.ferganalabs.com',
    title: 'Scheduler - AI Email Scheduling Agent',
    description:
      'AI-powered scheduling agent that reads your emails, checks your calendar, and drafts perfect replies automatically.',
    siteName: 'Scheduler',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scheduler - AI Email Scheduling Agent',
    description:
      'AI-powered scheduling agent that reads your emails, checks your calendar, and drafts perfect replies automatically.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <main className="bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
