'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import {
  InstagramIcon,
  YouTubeIcon,
  WhatsAppIcon,
  SOCIAL_LINKS,
} from './SocialIcons';

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

interface HomeClientProps {
  initialArticles?: Article[];
}

export default function HomeClient({ initialArticles = [] }: HomeClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [socialsExpanded, setSocialsExpanded] = useState(false);
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  const socialExpandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (socialExpandRef.current && !socialExpandRef.current.contains(e.target as Node)) {
        setSocialsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleArticleExpand = (id: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  // Fallback client-fetch if initialArticles was empty
  useEffect(() => {
    if (articles.length === 0) {
      async function fetchArticles() {
        try {
          setLoadingArticles(true);
          const res = await fetch('/api/articles');
          const data = await res.json();
          if (data.articles && data.articles.length > 0) {
            setArticles(data.articles);
          }
        } catch (err) {
          console.error('Failed to load articles:', err);
        } finally {
          setLoadingArticles(false);
        }
      }
      fetchArticles();
    }
  }, [articles.length]);

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
            'Thank you! Your application has been received and forwarded to our team at Independentminds.in@gmail.com.',
        });
        setFormData({
          name: '',
          email: '',
          city: '',
          role: 'Joining the community',
          message: '',
          agreeToContact: false,
        });
        setShowJoinSuccessModal(true);
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
            <img
              src="/logo-mark.png"
              alt="Independent Minds Initiative Crest"
              className="brand-logo-img"
              width={38}
              height={38}
            />
            <span>
              INDEPENDENT MINDS
              <br />
              <span style={{ color: 'var(--gold)' }}>INITIATIVE</span>
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

            {/* Expanding Social Media Channels Widget */}
            <div
              ref={socialExpandRef}
              className={`nav-social-expand ${socialsExpanded ? 'expanded' : ''}`}
            >
              <button
                type="button"
                className="nav-social-trigger"
                onClick={() => setSocialsExpanded(!socialsExpanded)}
                aria-expanded={socialsExpanded}
                aria-label={socialsExpanded ? 'Collapse social links' : 'Expand community social media channels'}
                title="Connect on Social Media"
              >
                <span className="nav-social-trigger-icon">✦</span>
                <span className="nav-social-trigger-label">Connect</span>
                <span className="nav-social-trigger-arrow">{socialsExpanded ? '✕' : '▸'}</span>
              </button>

              <div className="nav-social-drawer" aria-hidden={!socialsExpanded}>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-social-icon-btn whatsapp"
                  aria-label="Join WhatsApp Community"
                  title="WhatsApp Community Channel"
                >
                  <WhatsAppIcon size={15} />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-social-icon-btn instagram"
                  aria-label="Follow on Instagram"
                  title="Instagram (@voiceofindependentminds)"
                >
                  <InstagramIcon size={14} />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-social-icon-btn youtube"
                  aria-label="Subscribe on YouTube"
                  title="YouTube (@IndependentMindsInitiative)"
                >
                  <YouTubeIcon size={15} />
                </a>
              </div>
            </div>

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
            <div className="eyebrow">A space for independent thought · Public Initiative</div>
            <h1 className="serif">
              <span style={{ display: 'block', fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', color: 'var(--cream)', lineHeight: 1.1, marginBottom: '8px' }}>
                Independent Minds Initiative
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(1.5rem, 3.2vw, 2.3rem)', color: 'var(--gold)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.25 }}>
                Think Freely. Learn Deeply. Act Meaningfully.
              </span>
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
                  `mailto:Independentminds.in@gmail.com?subject=${encodeURIComponent(
                    art.title + ' discussion'
                  )}`;
                const isExpanded = Boolean(expandedArticles[art.id]);
                const hasMoreContent = Boolean(
                  (art.summary && art.summary.length > 90) || art.content
                );

                return (
                  <article
                    key={art.id}
                    className={`article ${isExpanded ? 'expanded' : ''}`}
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

                    {/* Summary & Content Body */}
                    <div className="article-body">
                      <p className={`article-summary-text ${!isExpanded && hasMoreContent ? 'clamped' : ''}`}>
                        {art.summary}
                      </p>

                      {/* Extended Content when user clicks Read more */}
                      {isExpanded && art.content && (
                        <div className="article-full-content">
                          {art.content}
                        </div>
                      )}

                      {/* Read More / Read Less Toggle Button */}
                      {hasMoreContent && (
                        <button
                          type="button"
                          className="article-read-more-btn"
                          onClick={() => toggleArticleExpand(art.id)}
                          aria-expanded={isExpanded}
                        >
                          <span>{isExpanded ? 'Read less' : 'Read more'}</span>
                          <span className="expand-arrow" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                            ▾
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Links (Anchored with margin-top: auto for grid symmetry) */}
                    <div className="article-footer">
                      {art.mediaUrl && !isImageFile(art.mediaUrl) && (
                        <a
                          href={art.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="article-media-pill"
                        >
                          <span>Attached Resource ↗</span>
                        </a>
                      )}

                      <a
                        className="text-link"
                        href={targetLink}
                        target={art.linkUrl?.startsWith('http') ? '_blank' : undefined}
                        rel={art.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {art.linkUrl?.startsWith('http') ? 'Explore article ↗' : 'Suggest this topic ↗'}
                      </a>
                    </div>
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
                  Independentminds.in@gmail.com.
                </p>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Looking to connect immediately?
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowJoinSuccessModal(true)}
                    style={{
                      background: 'rgba(217, 189, 120, 0.12)',
                      border: '1px solid rgba(217, 189, 120, 0.4)',
                      color: 'var(--gold)',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>✦ Join Community Channels</span>
                  </button>
                </div>
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
                href="mailto:Independentminds.in@gmail.com"
              >
                Email the team ↗
              </a>
              <p className="small" style={{ marginTop: '12px' }}>
                Email the team directly at Independentminds.in@gmail.com.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo-mark.png"
              alt="Independent Minds Initiative"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                objectFit: 'contain',
                background: '#f4eddf',
                border: '1px solid rgba(217, 189, 120, 0.45)',
                flexShrink: 0,
              }}
            />
            <div>
              © {currentYear} Independent Minds Initiative. Built around ideas, made for people.
            </div>
          </div>
          <div className="footer-links">
            <Link href="#vision">Vision</Link>
            <Link href="#focus">Focus areas</Link>
            <Link href="#insights">Insights</Link>
            <Link href="#join">Join us</Link>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-social-icon-btn whatsapp"
                aria-label="Join WhatsApp Community"
                title="WhatsApp Channel"
              >
                <WhatsAppIcon size={14} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-social-icon-btn instagram"
                aria-label="Follow on Instagram"
                title="Instagram (@voiceofindependentminds)"
              >
                <InstagramIcon size={13} />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-social-icon-btn youtube"
                aria-label="Subscribe on YouTube"
                title="YouTube (@IndependentMindsInitiative)"
              >
                <YouTubeIcon size={14} />
              </a>
            </div>
            <Link href="/privacy-policy" style={{ color: 'var(--muted)', marginLeft: '16px' }}>
              Privacy Policy
            </Link>
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

      {/* Post-Join Follow & Connect Modal */}
      {showJoinSuccessModal && (
        <div
          className="social-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="social-modal-title"
          onClick={() => setShowJoinSuccessModal(false)}
        >
          <div
            className="social-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="social-modal-close"
              onClick={() => setShowJoinSuccessModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="social-modal-header">
              <span className="social-modal-badge">✦ Registration Received</span>
              <h2 id="social-modal-title" className="social-modal-title">
                Welcome to Independent Minds
              </h2>
              <p className="social-modal-sub">
                Your application has been received and routed directly to our editorial team at Independentminds.in@gmail.com.
                Connect with our active channels to participate in discussions, reading circles, and publication updates:
              </p>
            </div>

            <div className="social-modal-list">
              {/* WhatsApp Community */}
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="social-channel-item"
              >
                <div className="social-channel-left">
                  <div className="social-channel-icon-wrap whatsapp">
                    <WhatsAppIcon size={22} />
                  </div>
                  <div className="social-channel-info">
                    <span className="social-channel-name">WhatsApp Community</span>
                    <span className="social-channel-desc">Official discussion &amp; announcements channel</span>
                  </div>
                </div>
                <span className="social-channel-btn whatsapp">Join ↗</span>
              </a>

              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-channel-item"
              >
                <div className="social-channel-left">
                  <div className="social-channel-icon-wrap instagram">
                    <InstagramIcon size={20} />
                  </div>
                  <div className="social-channel-info">
                    <span className="social-channel-name">Instagram</span>
                    <span className="social-channel-desc">@voiceofindependentminds · Ideas &amp; thinkers</span>
                  </div>
                </div>
                <span className="social-channel-btn instagram">Follow ↗</span>
              </a>

              {/* YouTube */}
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="social-channel-item"
              >
                <div className="social-channel-left">
                  <div className="social-channel-icon-wrap youtube">
                    <YouTubeIcon size={22} />
                  </div>
                  <div className="social-channel-info">
                    <span className="social-channel-name">YouTube Channel</span>
                    <span className="social-channel-desc">@IndependentMindsInitiative · Discussions &amp; talks</span>
                  </div>
                </div>
                <span className="social-channel-btn youtube">Subscribe ↗</span>
              </a>
            </div>

            <button
              type="button"
              className="social-modal-footer-btn"
              onClick={() => setShowJoinSuccessModal(false)}
            >
              Done · Return to Website
            </button>
          </div>
        </div>
      )}
    </>
  );
}
