import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found (404) | Independent Minds Initiative',
  description: 'The requested page could not be found. Explore our core focus areas, latest insights, or return to the homepage.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--navy)', color: 'var(--cream)' }}>
      {/* Top Navigation Bar */}
      <header className="header">
        <div className="wrap nav">
          <Link href="/" className="brand" aria-label="Independent Minds Initiative">
            <img
              src="/logo-mark.png"
              alt="IMI"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                objectFit: 'contain',
                background: '#f4eddf',
                border: '1px solid rgba(217, 189, 120, 0.45)',
                flexShrink: 0,
              }}
            />
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
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main style={{ flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div className="wrap" style={{ maxWidth: '680px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              color: 'var(--gold)',
              fontSize: '0.78rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'monospace',
            }}
          >
            HTTP 404 · Navigation Inquiry
          </div>

          <h1
            className="serif"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            This page is beyond our current frontier.
          </h1>

          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--muted)',
              marginBottom: '36px',
              maxWidth: '560px',
              margin: '0 auto 36px',
            }}
          >
            The link you followed may have expired, changed its coordinates, or does not exist. 
            We invite you to explore our core focus areas, read active insights, or return home.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/" className="btn">
              Return to Homepage ↗
            </Link>
            <Link href="/#insights" className="btn outline">
              Read Latest Insights
            </Link>
            <Link href="/#join" className="btn outline">
              Join the Community
            </Link>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--line)',
              paddingTop: '28px',
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/#vision" style={{ color: 'var(--muted)' }}>Vision</Link>
            <Link href="/#focus" style={{ color: 'var(--muted)' }}>Focus Areas</Link>
            <Link href="/privacy-policy" style={{ color: 'var(--muted)' }}>Privacy Policy</Link>
            <Link href="/admin" style={{ color: 'var(--gold)' }}>Admin Portal ↗</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            © {new Date().getFullYear()} Independent Minds Initiative. Built around ideas, made for people.
          </div>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/admin" style={{ color: 'var(--gold)' }}>Admin Portal ↗</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
