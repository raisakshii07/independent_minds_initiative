import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Independent Minds Initiative',
  description: 'Administrative portal for managing articles, timeout renewals, media, and community applications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
