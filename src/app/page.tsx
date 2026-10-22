'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';

const CATEGORIES = [
  { id: 'all', label: 'All topics' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'society', label: 'Society' },
  { id: 'economics', label: 'Economics' },
  { id: 'business', label: 'Business' },
  { id: 'history', label: 'History' },
  { id: 'science', label: 'Science & Technology' },
  { id: 'environment', label: 'Climate & Environment' },
  { id: 'politics', label: 'Politics & Governance' },
  { id: 'philosophy', label: 'Philosophy & Ideas' },
  { id: 'culture', label: 'Culture & Media' },
  { id: 'personal', label: 'Psychology & Personal Growth' },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const isImageFile = (url?: string): boolean => {
    if (!url) return false;
    return Boolean(
      url.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i) ||
      url.includes('/uploads/') ||
      url.includes('imagekit.io')
    );
  };

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    role: 'Joining the community',
    message: '',
    agreeToContact: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch active articles
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoadingArticles(true);
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(
    (item) => selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToContact) {
      setFormStatus({
        type: 'error',
        message: 'Please agree to be contacted about Independent Minds Initiative activities.',
      });
      return;
    }

    setSubmitting(true);
    setFormStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormStatus({
          type: 'success',
          message:
            'Thank you! Your application has been received and forwarded to our team at independentmindsinitiative@gmail.com.',
        });
        setFormData({
          name: '',
          email: '',
          city: '',
          role: 'Joining the community',
          message: '',
          agreeToContact: false,
        });
      } else {
        setFormStatus({
          type: 'error',
          message: data.error || 'Failed to submit application. Please try again.',
        });
      }
    } catch {
      setFormStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Header */}
      <header>
        <div className="wrap nav">
          <Link href="#home" className="brand" aria-label="Independent Minds Initiative home">
            <span className="brand-mark" aria-hidden="true">
              IMI
            </span>
            <span>
              INDEPENDENT MINDS
              <br />
              INITIATIVE
            </span>
          </Link>

          <button
            className="menu"
            id="menuButton"
            aria-expanded={mobileMenuOpen}
            aria-controls="navlinks"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 'Close ✕' : 'Menu ☰'}
          </button>

          <nav className={`navlinks ${mobileMenuOpen ? 'open' : ''}`} id="navlinks">
            <Link href="#vision" onClick={() => setMobileMenuOpen(false)}>
              Our Vision
            </Link>
            <Link href="#focus" onClick={() => setMobileMenuOpen(false)}>
              Focus Areas
            </Link>
            <Link href="#insights" onClick={() => setMobileMenuOpen(false)}>
              Insights
            </Link>
            <Link href="#about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link
              href="#join"
              className="btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join the Community ↗
            </Link>
          </nav>
        </div>
      </header>

      <main id="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="wrap hero-inner">
            <div className="eyebrow">A space for independent thought</div>
            <h1 className="serif">
              Think Freely.
              <br />
              Learn Deeply.
              <br />
              <em>Act Meaningfully.</em>
            </h1>
            <p className="lede">
              An emerging youth-led initiative creating space for independent
              thinking, meaningful learning, and informed action — across
              ideas, disciplines, and backgrounds.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#vision">
                Discover our vision ↗
              </a>
              <a className="btn outline" href="#join">
                Become part of the community
              </a>
            </div>
            <div className="hero-note">Curiosity · Courage · Community</div>
          </div>
        </section>

        {/* Section 01: Vision */}
        <section className="section" id="vision">
          <div className="wrap split">
            <div>
              <div className="eyebrow">01 / The idea</div>
              <h2 className="serif">Our Vision</h2>
            </div>
            <div className="vision-copy">
              A world where people think independently, question thoughtfully,
              learn continuously, and contribute meaningfully — across
              barriers and backgrounds.
            </div>
          </div>
        </section>

        {/* Statement Section */}
        <section className="statement">
          <div className="wrap statement-grid">
            <div>
              <div className="eyebrow">A place to begin</div>
              <h2 className="serif">
                Space to think.
                <br />
                Room to grow.
              </h2>
            </div>
            <div>
              <p>
                We believe young people deserve more than ready-made answers.
                They deserve the space to ask better questions, explore
                unfamiliar perspectives, and turn learning into meaningful
                participation.
              </p>
              <p className="muted small">
                Independent Minds Initiative is being built as a community for
                curiosity, dialogue, and action.
              </p>
            </div>
          </div>
        </section>

        {/* Section 02: Learning Beyond the Screen */}
        <section className="section learning">
          <div className="wrap learning-grid">
            <div className="orbit" aria-label="Abstract illustration of connected ideas">
              <div className="orbit-core" style={{ fontFamily: 'var(--serif)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '1rem' }}>IMI</div>
              <div className="orbit-label">Ideas in motion</div>
            </div>
            <div>
              <div className="eyebrow">02 / Our approach</div>
              <h2 className="serif">
                Learning Beyond
                <br />
                the Screen
              </h2>
              <p className="muted">
                Learning should not end with consuming information. It grows
                through conversations, creative experiments, community
                participation, and the courage to put ideas into practice.
              </p>
              <p className="muted">
                We aim to connect reflection with action — helping young
                people move from curiosity to capability.
              </p>
              <a className="text-link" href="#focus">
                Explore our focus areas ↗
              </a>
            </div>
          </div>
        </section>

        {/* Section 03: Focus Areas */}
        <section className="focus" id="focus">
          <div className="wrap">
            <div className="focus-head">
              <div>
                <div className="eyebrow">03 / What we explore</div>
                <h2 className="serif">Focus Areas</h2>
              </div>
              <p>
                Interconnected themes that encourage young people to think
                critically, participate constructively, and create positive
                change.
              </p>
            </div>
            <div className="cards">
              <article className="focus-card">
                <span className="number">01 — THINK</span>
                <h3>Independent Thinking</h3>
                <p>Question assumptions. Explore perspectives. Form considered opinions.</p>
              </article>
              <article className="focus-card">
                <span className="number">02 — LEARN</span>
                <h3>Learning by Doing</h3>
                <p>Connect knowledge with practical experiences and creative problem-solving.</p>
              </article>
              <article className="focus-card">
                <span className="number">03 — PARTICIPATE</span>
                <h3>Youth &amp; Civic Engagement</h3>
                <p>Make space for informed participation and responsible citizenship.</p>
              </article>
              <article className="focus-card">
                <span className="number">04 — CREATE</span>
                <h3>Ideas into Action</h3>
                <p>Turn thoughtful ideas into small, meaningful initiatives.</p>
              </article>
              <article className="focus-card">
                <span className="number">05 — CONNECT</span>
                <h3>Community &amp; Dialogue</h3>
                <p>Bring people together across experiences, disciplines, and backgrounds.</p>
              </article>
              <article className="focus-card">
                <span className="number">06 — GROW</span>
                <h3>Personal Growth</h3>
                <p>Build curiosity, confidence, communication, and lifelong learning habits.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Section 04: Insights & Knowledge */}
        <section className="insights" id="insights">
          <div className="wrap">
            <div className="insights-head">
              <div>
                <div className="eyebrow">04 / Ideas across disciplines</div>
                <h2 className="serif">Insights &amp; Knowledge</h2>
              </div>
              <p className="muted small">
                Explore the forces shaping our world — from geopolitics and
                society to business, economics, science, and culture.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div
              className="insight-filters"
              role="group"
              aria-label="Filter insights by knowledge category"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  data-filter={cat.id}
                  aria-pressed={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="articles" id="articleGrid">
              {filteredArticles.map((art) => {
                const targetLink =
                  art.linkUrl ||
                  `mailto:independentmindsinitiative@gmail.com?subject=${encodeURIComponent(
                    art.title + ' discussion'
                  )}`;
                return (
                  <article
                    key={art.id}
                    className="article"
                    data-category={art.category}
                  >
                    <div className="tag">{art.tag}</div>
                    <h3>{art.title}</h3>

                    {/* Dedicated Compact Framed Image Card for Mobile & Grid */}
                    {art.mediaUrl && isImageFile(art.mediaUrl) && (
                      <div
                        className="article-image-card"
                        onClick={() => setLightboxImage({ url: art.mediaUrl!, title: art.title })}
                        title="Click to view full image"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setLightboxImage({ url: art.mediaUrl!, title: art.title });
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.mediaUrl}
                          alt={art.title}
                          loading="lazy"
                        />
                        <div className="article-image-card-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                          <span>View</span>
                        </div>
                      </div>
                    )}

                    <p>{art.summary}</p>

                    {/* Non-image attached resource */}
                    {art.mediaUrl && !isImageFile(art.mediaUrl) && (
                      <div style={{ margin: '8px 0 12px 0' }}>
                        <a
                          href={art.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="article-media-pill"
                        >
                          <span>Attached Resource ↗</span>
                        </a>
                      </div>
                    )}

                    <a
                      className="text-link"
                      href={targetLink}
                      target={art.linkUrl?.startsWith('http') ? '_blank' : undefined}
                      rel={art.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {art.linkUrl?.startsWith('http') ? 'Explore article ↗' : 'Suggest this topic ↗'}
                    </a>
                  </article>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && !loadingArticles && (
              <p className="insight-empty show" id="insightEmpty">
                More articles in this topic are coming soon. You can suggest a
                subject to our team.
              </p>
            )}

            <p className="form-note">
              These are topic previews, not published research articles yet.
              New explainers and perspectives are updated dynamically via our
              editorial board.
            </p>
          </div>
        </section>

        {/* Section 05: Join the Community */}
        <section className="join" id="join">
          <div className="wrap join-grid">
            <div>
              <div className="eyebrow">05 / Find your people</div>
              <h2 className="serif">
                Join the
                <br />
                Community
              </h2>
              <p className="muted">
                If you care about ideas, learning, and making a thoughtful
                contribution, there is room for you here.
              </p>
              <p className="muted small">
                Students, curious minds, collaborators, and potential partners
                are all welcome.
              </p>
            </div>

            <div className="formbox">
              <h3>Let&apos;s stay connected.</h3>
              <p className="muted small">
                Tell us a little about yourself and what you would like to
                explore with Independent Minds Initiative.
              </p>

              <form id="joinForm" onSubmit={handleFormSubmit}>
                <div className="fields">
                  <div className="field">
                    <label htmlFor="name">YOUR NAME *</label>
                    <input
                      id="name"
                      name="name"
                      required
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">EMAIL ADDRESS *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="city">CITY / STATE</label>
                    <input
                      id="city"
                      name="city"
                      placeholder="Where are you based?"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="role">I&apos;M INTERESTED IN</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option>Joining the community</option>
                      <option>Volunteering</option>
                      <option>Writing or contributing</option>
                      <option>Collaborating / partnering</option>
                      <option>Events and programs</option>
                      <option>Learning more</option>
                    </select>
                  </div>

                  <div className="field full">
                    <label htmlFor="message">
                      WHAT EXCITES YOU ABOUT INDEPENDENT MINDS INITIATIVE?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Share an idea, interest, or question..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                </div>

                <label className="checkline">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeToContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeToContact: e.target.checked,
                      })
                    }
                  />
                  <span>
                    I agree to be contacted about Independent Minds Initiative
                    activities. *
                  </span>
                </label>

                <button
                  className="btn"
                  type="submit"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Submitting...' : 'Register your interest ↗'}
                </button>

                {formStatus.message && (
                  <div
                    className="form-message"
                    id="formMessage"
                    role="status"
                    style={{
                      borderColor:
                        formStatus.type === 'error' ? '#e55353' : 'var(--gold)',
                      color:
                        formStatus.type === 'error' ? '#fca5a5' : 'var(--cream)',
                    }}
                  >
                    {formStatus.message}
                  </div>
                )}

                <p className="form-note">
                  All registrations are securely routed directly to our team at
                  independentmindsinitiative@gmail.com.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Section 06: Founder / About */}
        <section className="founder" id="about">
          <div className="wrap founder-grid">
            <div>
              <div className="eyebrow">06 / The people behind it</div>
              <h2 className="serif">
                About /<br />
                Founder
              </h2>
            </div>
            <div>
              <div className="founder-name">Lakshay Rai</div>
              <p className="eyebrow">Founder, Independent Minds Initiative</p>
              <p className="muted">
                Independent Minds Initiative is being built around a simple
                belief: when young people have the space to think freely, learn
                deeply, and work together, they can contribute meaningfully to
                the world around them.
              </p>
              <p className="muted small">
                Dedicated to cultivating intellectual independence and
                empowering future leaders through open dialogue and critical
                inquiry.
              </p>
            </div>
          </div>
        </section>

        {/* Section 07: Contact */}
        <section className="contact">
          <div className="wrap contact-grid">
            <div>
              <div className="eyebrow">Start a conversation</div>
              <h2 className="serif">Contact</h2>
              <p>Interested in collaborating, contributing, or learning more?</p>
            </div>
            <div>
              <a
                className="btn outline"
                href="mailto:independentmindsinitiative@gmail.com"
              >
                Email the team ↗
              </a>
              <p className="small" style={{ marginTop: '12px' }}>
                Email the team directly at independentmindsinitiative@gmail.com.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            © {currentYear} Independent Minds Initiative. Built
            around ideas, made for people.
          </div>
          <div className="footer-links">
            <Link href="#vision">Vision</Link>
            <Link href="#focus">Focus areas</Link>
            <Link href="#insights">Insights</Link>
            <Link href="#join">Join us</Link>
            <Link href="/admin" style={{ color: 'var(--gold)', marginLeft: '16px' }}>
              Admin Portal ↗
            </Link>
          </div>
        </div>
      </footer>
      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="image-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="image-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-lightbox-header">
              <span className="image-lightbox-title">{lightboxImage.title}</span>
              <button
                className="image-lightbox-close"
                onClick={() => setLightboxImage(null)}
                type="button"
                aria-label="Close image preview"
              >
                <span>✕ Close</span>
              </button>
            </div>
            <div className="image-lightbox-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
