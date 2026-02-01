import type React from 'react';
import '@/app/globals.css';
import '@/app/styles/editor-theme.css';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ServerProvider } from '@/components/providers/server-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ConditionalLayout from '@/layout/conditional-layout';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolVibe - Decentralized Social Media on Solana',
  description:
    'Empowering creators with decentralized ownership, privacy, and fair rewards.',
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ServerProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ServerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
