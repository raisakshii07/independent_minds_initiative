import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Independent Minds Initiative — Think Freely. Learn Deeply.',
  description:
    'Independent Minds Initiative — a youth-led initiative creating space for independent thought, meaningful learning, and civic imagination.',
  keywords: [
    'Independent Minds Initiative',
    'Critical Thinking',
    'Civic Engagement',
    'Learning Beyond Screen',
    'Youth Dialogue',
    'Philosophy',
    'Lakshay Rai',
  ],
  authors: [{ name: 'Independent Minds Initiative' }],
  openGraph: {
    title: 'Independent Minds Initiative — Think Freely. Learn Deeply.',
    description:
      'A global initiative dedicated to developing independent thinkers who question information, analyse real-world issues, and form informed opinions.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
