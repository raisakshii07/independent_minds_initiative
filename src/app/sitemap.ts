import { MetadataRoute } from 'next';
import { getActiveArticles } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://independent-minds-initiative.onrender.com'
  ).replace(/\/$/, '');

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const articles = await getActiveArticles();
    // Only include internal same-domain routes in Google sitemap (Search Console rejects external domain URLs)
    const articleRoutes: MetadataRoute.Sitemap = articles
      .filter((art) => art.linkUrl && art.linkUrl.startsWith('/') && !art.linkUrl.startsWith('//'))
      .map((art) => ({
        url: `${baseUrl}${art.linkUrl}`,
        lastModified: art.createdAt ? new Date(art.createdAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
