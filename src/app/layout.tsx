import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://independent-minds-initiative.onrender.com'
).replace(/\/$/, '');

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Independent Minds Initiative — Think Freely. Learn Deeply. Act Meaningfully.',
    template: '%s | Independent Minds Initiative',
  },
  description:
    'Independent Minds Initiative is a youth-led platform creating space for independent thinking, deep inquiry, and civic imagination across society, geopolitics, philosophy, and economics.',
  keywords: [
    'Independent Minds Initiative',
    'Critical Thinking',
    'Civic Engagement',
    'Youth Leadership',
    'Open Dialogue',
    'Philosophy & Ideas',
    'Geopolitics & History',
    'Lakshay Rai',
    'Intellectual Independence',
  ],
  authors: [{ name: 'Independent Minds Initiative', url: siteUrl }],
  creator: 'Lakshay Rai',
  publisher: 'Independent Minds Initiative',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Independent Minds Initiative — Think Freely. Learn Deeply. Act Meaningfully.',
    description:
      'A global youth-led initiative creating space for independent thought, meaningful learning, and informed civic action across ideas and disciplines.',
    url: siteUrl,
    siteName: 'Independent Minds Initiative',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Independent Minds Initiative',
    description: 'Think Freely. Learn Deeply. Act Meaningfully.',
    creator: '@indmindsinit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org JSON-LD structured data for Educational Organization & Website
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}/#organization`,
        name: 'Independent Minds Initiative',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          'A youth-led platform creating space for independent thought, meaningful learning, and civic imagination across disciplines.',
        founder: {
          '@type': 'Person',
          name: 'Lakshay Rai',
        },
        sameAs: [
          'https://www.instagram.com/voiceofindependentminds',
          'https://youtube.com/@independentmindsintitiative?si=KI1qKEagouIZYRx8',
          'https://whatsapp.com/channel/0029VbEecer0lwglLOTOtp1v',
          'https://github.com/raisakshii07/independent_minds_initiative',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Independent Minds Initiative',
        description: 'Think Freely. Learn Deeply. Act Meaningfully.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the Independent Minds Initiative?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Independent Minds Initiative is an emerging youth-led platform and community dedicated to cultivating intellectual independence, open inquiry, and civic imagination across society, geopolitics, philosophy, and economics.',
            },
          },
          {
            '@type': 'Question',
            name: 'Who founded the Independent Minds Initiative?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Independent Minds Initiative was founded by Lakshay Rai to provide young thinkers with space for deep learning, open dialogue, and informed action beyond algorithmic feeds.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I join the Independent Minds Initiative?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can join by submitting an application directly on the official website or by contacting the team at Independentminds.in@gmail.com.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Critical inline styles to eliminate Flash of Unstyled Content (FOUC) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { --navy: #071727; --cream: #f4eddf; --gold: #d9bd78; }
              html, body { background-color: #071727 !important; color: #f4eddf !important; margin: 0; padding: 0; }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}

        {/* Google Analytics GA4 Script (Enabled when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured) */}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
