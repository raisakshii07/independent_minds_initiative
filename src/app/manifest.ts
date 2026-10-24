import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Independent Minds Initiative',
    short_name: 'IMI',
    description:
      'Youth-led platform dedicated to cultivating intellectual independence, open inquiry, and civic imagination.',
    start_url: '/',
    display: 'standalone',
    background_color: '#071727',
    theme_color: '#071727',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
