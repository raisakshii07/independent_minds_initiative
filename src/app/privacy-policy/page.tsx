import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Independent Minds Initiative',
  description:
    'Read the official Privacy Policy of the Independent Minds Initiative. Learn how we collect, store, protect, and handle community applications and data.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Independent Minds Initiative',
    description:
      'Our commitment to privacy, data protection, and transparency for all community members and site visitors.',
    url: '/privacy-policy',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--navy)', color: 'var(--cream)' }}>
      {/* Top Header Navigation */}
      <header className="header">
        <div className="wrap nav">
          <Link href="/" className="brand" aria-label="Independent Minds Initiative Home">
            <span className="brand-badge">IMI</span>
            <div className="brand-title">
              <strong>Independent Minds Initiative</strong>
              <span>Think freely. Learn deeply.</span>
            </div>
          </Link>
          <div className="navlinks open" style={{ display: 'flex' }}>
            <Link href="/#vision">Vision</Link>
            <Link href="/#focus">Focus areas</Link>
            <Link href="/#insights">Insights</Link>
            <Link href="/#join">Join us</Link>
            <Link href="/admin" style={{ color: 'var(--gold)' }}>Admin</Link>
          </div>
        </div>
      </header>

      {/* Main Privacy Policy Content */}
      <main style={{ flex: '1 0 auto', padding: '60px 0 90px 0' }}>
        <article className="wrap" style={{ maxWidth: '800px' }}>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '0.78rem',
                color: 'var(--muted)',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <li>
                <Link href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                  Home
                </Link>
              </li>
              <li>/</li>
              <li aria-current="page" style={{ color: 'var(--cream)' }}>
                Privacy Policy
              </li>
            </ol>
          </nav>

          <div className="eyebrow">Legal &amp; Trust Architecture</div>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              margin: '12px 0 24px 0',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '20px',
            }}
          >
            Privacy Policy
          </h1>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--muted)',
              marginBottom: '36px',
              fontFamily: 'monospace',
            }}
          >
            Effective Date: October 2026 · Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>

          <div style={{ fontSize: '0.96rem', lineHeight: '1.75', color: '#d8e2ea', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                1. Overview &amp; Commitment
              </h2>
              <p>
                The <strong>Independent Minds Initiative</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is an independent,
                youth-led initiative dedicated to cultivating intellectual independence, civic imagination, and open inquiry.
                We believe that freedom of thought requires respectful treatment of personal data. This Privacy Policy describes how we
                collect, utilize, store, and safeguard your information when you access our platform at{' '}
                <a href="https://independent-minds-initiative.onrender.com" style={{ color: 'var(--gold)' }}>
                  independent-minds-initiative.onrender.com
                </a>{' '}
                or communicate with our team.
              </p>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                2. Information We Collect
              </h2>
              <p>We only collect personal information that you voluntarily choose to share with us, specifically through:</p>
              <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Community Applications:</strong> Full name, email address, city/region, area of interest or role (e.g. Writer,
                  Discussion Member, Researcher), and any introductory statement or inquiry you provide in the form.
                </li>
                <li>
                  <strong>Direct Inquiries:</strong> Any email correspondence directed to{' '}
                  <code style={{ color: 'var(--gold)' }}>Independentminds.in@gmail.com</code>.
                </li>
                <li>
                  <strong>Technical &amp; Analytics Data:</strong> Standard server logs, approximate geographic region, browser type, and
                  anonymized page interaction metrics collected via privacy-conscious analytics to monitor uptime and reader interest.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                3. Purpose of Data Processing
              </h2>
              <p>We process your information strictly for legitimate organizational purposes:</p>
              <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Evaluating and acknowledging applications to join community discussion circles.</li>
                <li>Transmitting invitations to reading circles, intellectual exchanges, and initiative updates.</li>
                <li>Ensuring the technical security, integrity, and operational availability of our cloud web platform.</li>
                <li>Preventing malicious traffic, automated abuse, and spam submissions.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                <strong>We do not sell, rent, monetize, or broker your personal information to any commercial advertisers or third-party brokers.</strong>
              </p>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                4. Infrastructure &amp; Third-Party Services
              </h2>
              <p>To deliver a fast, reliable, and secure experience, we partner with trusted infrastructure providers:</p>
              <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>MongoDB Atlas:</strong> Encrypted cloud database infrastructure used to store community records and active editorial insights.
                </li>
                <li>
                  <strong>Render Services:</strong> Cloud web application hosting environment with automated HTTPS SSL/TLS encryption.
                </li>
                <li>
                  <strong>ImageKit CDN:</strong> Content delivery network used to securely optimize and serve article thumbnails and visual assets.
                </li>
                <li>
                  <strong>Google Search Console &amp; Analytics:</strong> Anonymized indexing metrics and search performance tracking to improve educational reach.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                5. Content Lifecycle &amp; 30-Day Timeout
              </h2>
              <p>
                Our platform features a dynamic editorial lifecycle where articles are indexed with automated 30-day time-to-live (TTL) expiration.
                Application records submitted by members are retained only as long as necessary to maintain communication with active participants
                or until a deletion request is received.
              </p>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                6. Your Privacy Rights
              </h2>
              <p>
                Regardless of your location, you have the right to request access to the personal data we hold about you, request corrections
                to any inaccuracies, or request the permanent deletion of your application and email from our database.
              </p>
              <p style={{ marginTop: '10px' }}>
                To exercise any of these rights, email our team at{' '}
                <a href="mailto:Independentminds.in@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                  Independentminds.in@gmail.com
                </a>{' '}
                with the subject line &ldquo;Privacy Request&rdquo;.
              </p>
            </section>

            <section>
              <h2 className="serif" style={{ fontSize: '1.45rem', color: 'var(--gold)', marginBottom: '12px', fontWeight: 400 }}>
                7. Contact Our Initiative
              </h2>
              <p>If you have any questions, suggestions, or concerns regarding this policy, please reach out to us:</p>
              <div
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  padding: '20px',
                  borderRadius: '3px',
                  marginTop: '12px',
                }}
              >
                <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '6px' }}>Independent Minds Initiative</div>
                <div>Email: <a href="mailto:Independentminds.in@gmail.com" style={{ color: 'var(--cream)' }}>Independentminds.in@gmail.com</a></div>
                <div style={{ marginTop: '6px', fontSize: '0.84rem', color: 'var(--muted)' }}>Founder: Lakshay Rai · Dedicated to Open Intellectual Inquiry</div>
              </div>
            </section>
          </div>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
            <Link href="/" className="btn outline">
              ← Return to Homepage
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            © {currentYear} Independent Minds Initiative. Built around ideas, made for people.
          </div>
          <div className="footer-links">
            <Link href="/#vision">Vision</Link>
            <Link href="/#focus">Focus areas</Link>
            <Link href="/#insights">Insights</Link>
            <Link href="/privacy-policy" style={{ color: 'var(--gold)' }}>Privacy Policy</Link>
            <Link href="/admin">Admin Portal ↗</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
