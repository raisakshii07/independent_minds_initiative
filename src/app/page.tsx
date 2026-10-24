import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { getActiveArticles } from '@/lib/db';

// Revalidate every 60 seconds for dynamic Server-Side Rendering
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Independent Minds Initiative — Think Freely. Learn Deeply. Act Meaningfully.',
  description:
    'An emerging youth-led initiative creating space for independent thinking, meaningful learning, and informed civic action across ideas, disciplines, and backgrounds.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Independent Minds Initiative — Think Freely. Learn Deeply. Act Meaningfully.',
    description:
      'A global youth-led initiative creating space for independent thought, meaningful learning, and informed civic action across ideas and disciplines.',
    url: '/',
    type: 'website',
  },
};

export default async function HomePage() {
  let initialArticles: Awaited<ReturnType<typeof getActiveArticles>> = [];
  try {
    initialArticles = await getActiveArticles();
  } catch (err) {
    console.error('Error loading articles during server-side render:', err);
  }

  return <HomeClient initialArticles={initialArticles} />;
}
