'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Article, MediaItem, CommunityApplication } from '@/lib/types';
import {
  Shield,
  Clock,
  Upload,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Mail,
  CheckCircle,
  AlertCircle,
  LogOut,
  ExternalLink,
  Plus,
  Copy,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

const CATEGORIES = [
  'geopolitics',
  'society',
  'economics',
  'business',
  'history',
  'science',
  'environment',
  'politics',
  'philosophy',
  'culture',
  'personal',
];

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'articles' | 'media' | 'applications' | 'settings'>('articles');
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [purgedCount, setPurgedCount] = useState<number>(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [applications, setApplications] = useState<CommunityApplication[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Article Form State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'geopolitics',
    tag: '',
    summary: '',
    linkUrl: '',
    mediaUrl: '',
    expirationDays: 30,
  });
  const [creatingArticle, setCreatingArticle] = useState(false);

  // Media Upload & Link State
  const [mediaUploadType, setMediaUploadType] = useState<'file' | 'link'>('file');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaLinkUrl, setMediaLinkUrl] = useState('');
  const [mediaLinkCategory, setMediaLinkCategory] = useState<'link' | 'video' | 'document'>('link');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // SMTP Test State
  const [testingEmail, setTestingEmail] = useState(false);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Check Current Session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data.user.username);
        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Fetch Dashboard Data
  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 1. Articles with admin stats
      const artRes = await fetch('/api/articles?adminMode=true');
      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.articles || []);
        setPurgedCount(artData.purgedCount || 0);
      }

      // 2. Media Items
      const mediaRes = await fetch('/api/media');
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaItems(mediaData.media || []);
      }

      // 3. Applications
      const appRes = await fetch('/api/admin/applications');
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
    checkSession().then((authenticated) => {
      if (authenticated) {
        loadDashboardData();
      }
    });
  }, [checkSession, loadDashboardData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user.username);
        showToast('Logged in successfully.');
        loadDashboardData();
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setLoginError('Server error while authenticating. Check network connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setCurrentUser('');
      showToast('Logged out securely.');
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Create Article
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingArticle(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Article published with 30-day automatic timeout.');
        setShowArticleModal(false);
        setArticleForm({
          title: '',
          category: 'geopolitics',
          tag: '',
          summary: '',
          linkUrl: '',
          mediaUrl: '',
          expirationDays: 30,
        });
        loadDashboardData();
      } else {
        showToast(data.error || 'Failed to create article', 'error');
      }
    } catch {
      showToast('Network error while creating article', 'error');
    } finally {
      setCreatingArticle(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('Article deleted successfully.');
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        showToast(data.error || 'Failed to delete article', 'error');
      }
    } catch {
      showToast('Error deleting article', 'error');
    }
  };

  // Renew Article Expiration (+30 Days)
  const handleRenewArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Article renewed for an additional 30 days.');
        loadDashboardData();
      } else {
        showToast(data.error || 'Failed to renew expiration', 'error');
      }
    } catch {
      showToast('Error renewing article', 'error');
    }
  };

  // Upload Media / Link
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingMedia(true);

    try {
      if (mediaUploadType === 'file') {
        if (!selectedFile) {
          showToast('Please select a file to upload.', 'error');
          setUploadingMedia(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', mediaTitle || selectedFile.name);

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('Media file uploaded successfully.');
          setSelectedFile(null);
          setMediaTitle('');
          loadDashboardData();
        } else {
          showToast(data.error || 'Failed to upload file', 'error');
        }
      } else {
        // Link mode
        if (!mediaLinkUrl) {
          showToast('Please provide a URL.', 'error');
          setUploadingMedia(false);
          return;
        }

        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: mediaTitle || mediaLinkUrl,
            url: mediaLinkUrl,
            type: mediaLinkCategory,
          }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('Media link added to registry.');
          setMediaTitle('');
          setMediaLinkUrl('');
          loadDashboardData();
        } else {
          showToast(data.error || 'Failed to add link', 'error');
        }
      }
    } catch {
      showToast('Network error while processing media', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Delete Media
  const handleDeleteMedia = async (id: string, title: string) => {
    if (!confirm(`Delete media item "${title}"?`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('Media deleted successfully.');
        setMediaItems(mediaItems.filter((m) => m.id !== id));
      } else {
        showToast(data.error || 'Failed to delete media', 'error');
      }
    } catch {
      showToast('Error deleting media', 'error');
    }
  };

  // Test Email
  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'SMTP test failed', 'error');
      }
    } catch {
      showToast('Network error while testing SMTP', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  // Time remaining helper for 30-day auto deletion
  const getTimeRemaining = (expiresAtStr: string) => {
    if (!currentTime) return 'Calculating...';
    const diff = new Date(expiresAtStr).getTime() - currentTime;
    if (diff <= 0) return 'Expired (Purging...)';
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  // Render Loading State
  if (!mounted || isAuthenticated === null) {
    return (
      <div className="admin-login-screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--cream)' }}>
          <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '0.88rem' }}>Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  // Render Login Modal / View if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-card">
          <div className="admin-brand-header">
            <div className="admin-brand-logo">
              IMI
            </div>
            <div className="admin-brand-title-wrap">
              <h1 className="admin-brand-title">
                Independent Minds
              </h1>
              <div className="admin-brand-sub">
                Admin Control Portal
              </div>
            </div>
          </div>

          <p className="admin-card-desc">
            Sign in with administrative privileges to manage articles, 30-day
            expiration schedules, media assets, and view community applications.
          </p>

          {loginError && (
            <div className="admin-error-box">
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label className="admin-label">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="admin-input"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Security Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="admin-submit-btn"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize Session ↗</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="admin-card-footer">
            <div className="admin-card-footer-item">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>JWT Authentication &amp; Sliding Window Rate Limiting</span>
            </div>
            <div className="admin-card-footer-item">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>Default initial credentials: <strong>admin</strong> / <strong>AdminPassword!2026#</strong></span>
            </div>
          </div>

          <div className="admin-back-wrap">
            <Link href="/" className="admin-back-link">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--navy)', color: 'var(--cream)' }}>
      {/* Toast Notification */}
      {notification && (
        <div className={`admin-toast-box ${notification.type === 'error' ? 'error' : ''}`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="admin-dash-header">
        <div className="wrap admin-dash-nav">
          <div className="admin-dash-brand">
            <div className="admin-brand-logo" style={{ width: '34px', height: '34px', fontSize: '0.8rem' }}>
              IMI
            </div>
            <div>
              <h2 className="admin-dash-title">
                Independent Minds Initiative
              </h2>
              <div className="admin-dash-auth-pill">
                <span className="admin-status-dot"></span>
                <span>ADMIN PORTAL · JWT Authenticated ({currentUser})</span>
              </div>
            </div>
          </div>

          <div className="admin-dash-actions">
            <Link
              href="/"
              target="_blank"
              className="admin-dash-btn-sm"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="admin-dash-btn-danger"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="wrap admin-dash-tabs">
          <button
            onClick={() => setActiveTab('articles')}
            className={`admin-dash-tab ${activeTab === 'articles' ? 'active' : ''}`}
          >
            <Clock className="w-4 h-4" />
            <span>Articles &amp; 30-Day Timeout ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`admin-dash-tab ${activeTab === 'media' ? 'active' : ''}`}
          >
            <Upload className="w-4 h-4" />
            <span>Media &amp; Links ({mediaItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`admin-dash-tab ${activeTab === 'applications' ? 'active' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>Community Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`admin-dash-tab ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Shield className="w-4 h-4" />
            <span>Settings &amp; Email Engine</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="wrap" style={{ padding: '32px 0 64px 0' }}>
        {/* ============================================================== */}
        {/* TAB 1: ARTICLES MANAGEMENT WITH 30-DAY TIMEOUT                */}
        {/* ============================================================== */}
        {activeTab === 'articles' && (
          <div>
            <div className="admin-dash-banner">
              <div>
                <h2 className="admin-dash-banner-title">
                  Insights &amp; Knowledge Articles
                </h2>
                <p className="admin-dash-banner-sub">
                  Every published article features an automatic <strong>30-day expiration timer</strong>. Expired articles are automatically purged from the public site.
                </p>
                {purgedCount > 0 && (
                  <div className="admin-dash-banner-note">
                    • {purgedCount} past expired articles automatically cleaned by system
                  </div>
                )}
              </div>

              <div className="admin-dash-banner-actions">
                <button
                  onClick={loadDashboardData}
                  className="btn outline"
                  style={{ fontSize: '0.74rem', padding: '8px 14px' }}
                  title="Refresh articles"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="btn"
                  style={{ fontSize: '0.74rem', padding: '8px 14px' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Article</span>
                </button>
              </div>
            </div>

            {/* Articles List */}
            <div className="admin-articles-grid">
              {articles.map((art) => (
                <div key={art.id} className="admin-article-box">
                  <div>
                    <div className="admin-article-top">
                      <span className="admin-tag-pill">
                        {art.tag}
                      </span>
                      <span className="admin-timer-pill">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(art.expiresAt)}
                      </span>
                    </div>

                    <h3 className="admin-article-title">{art.title}</h3>
                    <p className="admin-article-summary">
                      {art.summary}
                    </p>

                    {art.mediaUrl && (
                      <div className="admin-article-media-pill">
                        Attached Media: <span style={{ color: 'var(--gold)' }}>{art.mediaUrl}</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-article-actions">
                    <button
                      onClick={() => handleRenewArticle(art.id)}
                      className="admin-action-renew"
                      title="Extend article expiration by another 30 days"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>+30 Days</span>
                    </button>

                    <button
                      onClick={() => handleDeleteArticle(art.id, art.title)}
                      className="admin-action-delete"
                      title="Delete immediately"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {articles.length === 0 && !loadingData && (
              <div className="admin-empty-box">
                <FileText className="w-10 h-10" style={{ color: 'rgba(217,189,120,0.4)', display: 'block', margin: '0 auto 12px' }} />
                <h3>No Active Articles</h3>
                <p>
                  All active articles are displayed here. Click &quot;Publish New Article&quot; to add content with a 30-day automatic timeout.
                </p>
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="btn"
                  style={{ fontSize: '0.76rem', padding: '9px 18px' }}
                >
                  Publish Article Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MEDIA & LINK MANAGEMENT                                */}
        {/* ============================================================== */}
        {activeTab === 'media' && (
          <div>
            {/* Media Upload Box */}
            <div className="admin-media-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="admin-settings-title" style={{ margin: 0 }}>
                    Upload Media &amp; Share Links
                  </h3>
                  <p className="admin-dash-banner-note" style={{ margin: '4px 0 0 0' }}>
                    • Multer Parser + ImageKit CDN (Single Media Upload)
                  </p>
                </div>
                <div className="admin-media-type-bar">
                  <button
                    type="button"
                    onClick={() => setMediaUploadType('file')}
                    className={`admin-media-type-btn ${mediaUploadType === 'file' ? 'active' : ''}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaUploadType('link')}
                    className={`admin-media-type-btn ${mediaUploadType === 'link' ? 'active' : ''}`}
                  >
                    Share External Link
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMedia}>
                <div className="admin-form-group">
                  <label className="admin-label">
                    Title / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="e.g. Geopolitics Map 2026 or Research Paper PDF"
                    className="admin-input"
                  />
                </div>

                {mediaUploadType === 'file' ? (
                  <div className="admin-form-group">
                    <label className="admin-label">
                      Choose File (Images, PDF, Videos up to 25MB)
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="admin-input"
                      style={{ padding: '8px' }}
                    />
                  </div>
                ) : (
                  <div className="admin-row-2 admin-form-group">
                    <div>
                      <label className="admin-label">
                        URL / Link
                      </label>
                      <input
                        type="url"
                        required
                        value={mediaLinkUrl}
                        onChange={(e) => setMediaLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">
                        Link Category
                      </label>
                      <select
                        value={mediaLinkCategory}
                        onChange={(e) =>
                          setMediaLinkCategory(e.target.value as 'link' | 'video' | 'document')
                        }
                        className="admin-select"
                      >
                        <option value="link">General External Link</option>
                        <option value="video">Video (YouTube / Vimeo / Drive)</option>
                        <option value="document">Document / PDF</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadingMedia}
                  className="btn"
                  style={{ fontSize: '0.78rem', padding: '10px 18px' }}
                >
                  {uploadingMedia ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{mediaUploadType === 'file' ? 'Upload to Server' : 'Save Link'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Media Items Table / Grid */}
            <div className="admin-dash-banner" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 className="admin-dash-banner-title" style={{ fontSize: '1.15rem' }}>
                  Stored Media &amp; Shared Links
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                  {mediaItems.length} items registered
                </span>
              </div>

              <div className="admin-media-grid">
                {mediaItems.map((item) => (
                  <div key={item.id} className="admin-media-item-box">
                    <div>
                      <div className="admin-media-type-tag">
                        {item.type === 'image' ? (
                          <ImageIcon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        ) : item.type === 'document' ? (
                          <FileText className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        ) : (
                          <LinkIcon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        )}
                        <span>{item.type}</span>
                      </div>

                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>
                        {item.title}
                      </h4>

                      {item.url && item.type === 'image' && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.title}
                          className="admin-media-thumb"
                        />
                      )}

                      <div className="admin-media-url">
                        {item.url}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: '#8fa3b0' }}>
                        Added on {new Date(item.createdAt).toLocaleDateString()}
                        {item.size ? ` · ${(item.size / 1024).toFixed(1)} KB` : ''}
                      </div>
                    </div>

                    <div className="admin-media-actions">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="admin-action-renew"
                        style={{ border: 'none', padding: 0 }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMedia(item.id, item.title)}
                        className="admin-action-delete"
                        style={{ border: 'none', padding: 0 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {mediaItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  No media uploaded or links shared yet. Use the upload box above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: COMMUNITY APPLICATIONS INBOX                            */}
        {/* ============================================================== */}
        {activeTab === 'applications' && (
          <div>
            <div className="admin-dash-banner">
              <div>
                <h2 className="admin-dash-banner-title">
                  Community Applications &amp; Responses
                </h2>
                <p className="admin-dash-banner-sub">
                  All submissions are automatically routed to{' '}
                  <strong style={{ color: 'var(--gold)' }}>independentmindsinitiative@gmail.com</strong> and archived here.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="btn outline"
                style={{ fontSize: '0.74rem', padding: '8px 14px' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>

            <div>
              {applications.map((app) => (
                <div key={app.id} className="admin-app-box">
                  <div className="admin-app-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="admin-app-name">{app.name}</span>
                      <span className="admin-app-role">
                        {app.role}
                      </span>
                    </div>

                    <div className="admin-app-date">
                      {new Date(app.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="admin-app-meta-grid">
                    <div>
                      <strong style={{ color: 'var(--gold)' }}>Email:</strong>{' '}
                      <a
                        href={`mailto:${app.email}?subject=Independent Minds Initiative Community`}
                        style={{ textDecoration: 'underline', color: 'var(--cream)' }}
                      >
                        {app.email}
                      </a>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--gold)' }}>Location:</strong>{' '}
                      {app.city || 'Not provided'}
                    </div>
                  </div>

                  {app.message && (
                    <div className="admin-app-message">
                      {app.message}
                    </div>
                  )}

                  <div className="admin-app-footer">
                    <div>
                      {app.emailSent ? (
                        <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Dispatched to independentmindsinitiative@gmail.com</span>
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Archived in database (SMTP notification ready)</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={`mailto:${app.email}?subject=Welcome%20to%20Independent%20Minds%20Initiative`}
                      className="btn"
                      style={{ fontSize: '0.72rem', padding: '6px 14px' }}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply Directly ↗</span>
                    </a>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="admin-empty-box">
                  <Mail className="w-10 h-10" style={{ color: 'rgba(217,189,120,0.4)', display: 'block', margin: '0 auto 12px' }} />
                  <h3>No Applications Received Yet</h3>
                  <p>
                    When curious minds submit the &quot;Join the Community&quot; form on the homepage, their responses will appear here and in your inbox.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SETTINGS & EMAIL ENGINE                                */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div>
            <div className="admin-settings-box">
              <h2 className="admin-settings-title">
                <Mail className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                <span>Email Engine &amp; Notification Configuration</span>
              </h2>
              <p className="admin-settings-sub">
                Community join responses are designated for delivery to{' '}
                <strong style={{ color: 'var(--gold)' }}>independentmindsinitiative@gmail.com</strong>.
              </p>

              <div className="admin-info-box">
                <div style={{ fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', marginBottom: '8px' }}>
                  Configuring Live Gmail SMTP Sending (.env.local):
                </div>
                <p style={{ margin: '0 0 10px 0' }}>
                  To send emails from your Google account using Nodemailer, generate a 16-character Google App Password:
                </p>
                <ol style={{ paddingLeft: '20px', margin: '0 0 12px 0', lineHeight: 1.8 }}>
                  <li>Visit your Google Account &gt; Security &gt; 2-Step Verification.</li>
                  <li>Scroll to the bottom and select <strong>App passwords</strong>.</li>
                  <li>Name it <em>&quot;Independent Minds Portal&quot;</em> and generate a 16-character code.</li>
                  <li>
                    Place these credentials in your local environment file (<code style={{ color: 'var(--gold)' }}>.env.local</code>):
                  </li>
                </ol>

                <div className="admin-code-snippet">
                  SMTP_HOST=smtp.gmail.com<br />
                  SMTP_PORT=465<br />
                  SMTP_USER=independentmindsinitiative@gmail.com<br />
                  SMTP_PASS=your-16-char-app-password<br />
                  SMTP_FROM=&quot;Independent Minds Initiative&quot; &lt;independentmindsinitiative@gmail.com&gt;
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="btn"
                  style={{ fontSize: '0.74rem', padding: '10px 18px' }}
                >
                  {testingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Test Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Test Verification Email</span>
                    </>
                  )}
                </button>
                <span style={{ fontSize: '0.72rem', color: '#8fa3b0' }}>
                  Sends a test message directly to independentmindsinitiative@gmail.com
                </span>
              </div>
            </div>

            {/* ImageKit Configuration Card */}
            <div className="admin-settings-box">
              <h2 className="admin-settings-title">
                <Upload className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                <span>ImageKit Media CDN &amp; Multer Integration</span>
              </h2>
              <p className="admin-settings-sub">
                Media files are parsed with <strong>Multer</strong> (single media upload, max 25MB) and streamed to <strong>ImageKit Real-time CDN</strong>.
              </p>

              <div className="admin-info-box">
                <div style={{ fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', marginBottom: '8px' }}>
                  Setting up ImageKit in .env.local:
                </div>
                <p style={{ margin: '0 0 10px 0' }}>
                  Create a free ImageKit account at <a href="https://imagekit.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>imagekit.io</a> (20GB free bandwidth/mo), copy your API keys from <em>Developer Options</em>, and add them to <code style={{ color: 'var(--gold)' }}>.env.local</code>:
                </p>

                <div className="admin-code-snippet">
                  IMAGEKIT_PUBLIC_KEY=your_public_key<br />
                  IMAGEKIT_PRIVATE_KEY=your_private_key<br />
                  IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
                </div>

                <p style={{ fontSize: '0.72rem', color: '#8fa3b0', margin: '10px 0 0 0' }}>
                  • If ImageKit keys are not yet provided, Multer gracefully falls back to local server storage, so uploads never fail.
                </p>
              </div>
            </div>

            {/* Database Engine Card (MongoDB Atlas vs Local) */}
            <div className="admin-settings-box">
              <h2 className="admin-settings-title">
                <FileText className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                <span>Database Engine (MongoDB Atlas Cloud Integration)</span>
              </h2>
              <p className="admin-settings-sub">
                The application supports both <strong>MongoDB Atlas (Cloud Production)</strong> and local JSON persistence. For a live public site publishing articles daily and collecting applications, MongoDB Atlas is strongly recommended.
              </p>

              <div className="admin-info-box">
                <div style={{ fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', marginBottom: '8px' }}>
                  Connecting MongoDB Atlas (.env.local):
                </div>
                <p style={{ margin: '0 0 10px 0' }}>
                  1. Create a free M0 cluster at <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>mongodb.com/cloud/atlas</a> (512MB free forever).<br />
                  2. Under <em>Database Access</em>, create a database user and password.<br />
                  3. Under <em>Network Access</em>, allow access from anywhere (<code style={{ color: 'var(--gold)' }}>0.0.0.0/0</code>).<br />
                  4. Click <em>Connect &gt; Drivers</em> and copy the connection string into <code style={{ color: 'var(--gold)' }}>.env.local</code>:
                </p>

                <div className="admin-code-snippet">
                  MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/independent_minds?retryWrites=true&amp;w=majority
                </div>

                <p style={{ fontSize: '0.72rem', color: '#8fa3b0', margin: '10px 0 0 0' }}>
                  • <strong>Native 30-Day TTL Index:</strong> MongoDB automatically purges articles older than 30 days at the database engine level via its native TTL index on <code>expiresAt</code>.
                </p>
              </div>
            </div>

            {/* Architecture & Security Info */}
            <div className="admin-dash-banner" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <h3 className="admin-settings-title" style={{ fontSize: '1.05rem', margin: '0 0 12px 0' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                <span>Security &amp; Scalability Architecture</span>
              </h3>
              <div className="admin-arch-grid">
                <div className="admin-arch-card">
                  <div className="admin-arch-card-title">JWT Auth Protection</div>
                  <p className="admin-arch-card-desc">
                    All admin mutations (media upload, deletion, article publishing, and applications viewing) are protected by cryptographic JSON Web Tokens signed with HMAC-SHA256 and stored in secure HttpOnly cookies.
                  </p>
                </div>

                <div className="admin-arch-card">
                  <div className="admin-arch-card-title">Sliding-Window Rate Limiter</div>
                  <p className="admin-arch-card-desc">
                    In-memory token bucket rate limiters set to 10 requests per second across login, media uploads, and public community forms to prevent denial-of-service and brute force while ensuring instant access.
                  </p>
                </div>

                <div className="admin-arch-card">
                  <div className="admin-arch-card-title">30-Day Auto Timeout</div>
                  <p className="admin-arch-card-desc">
                    Articles carry an automatic 30-day lifecycle expiration. Stale content is automatically purged on access, with live remaining countdowns and one-click +30 day extension controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: PUBLISH NEW ARTICLE WITH 30-DAY TIMEOUT                */}
      {/* ============================================================== */}
      {showArticleModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-head">
              <div>
                <h3 className="admin-dash-banner-title" style={{ fontSize: '1.25rem', margin: 0 }}>Publish New Article</h3>
                <p className="admin-dash-banner-note" style={{ margin: '4px 0 0 0' }}>
                  • Automatic 30-day deletion timer will be activated upon publication
                </p>
              </div>
              <button
                onClick={() => setShowArticleModal(false)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArticle}>
              <div className="admin-form-group">
                <label className="admin-label">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Navigating Critical Thinking in the Age of Algorithmic Echo Chambers"
                  className="admin-input"
                />
              </div>

              <div className="admin-row-2 admin-form-group">
                <div>
                  <label className="admin-label">
                    Category *
                  </label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="admin-select"
                    style={{ textTransform: 'capitalize' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">
                    Tag / Label
                  </label>
                  <input
                    type="text"
                    value={articleForm.tag}
                    onChange={(e) => setArticleForm({ ...articleForm, tag: e.target.value })}
                    placeholder="e.g. Geopolitics · Explainer"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  Summary / Excerpt *
                </label>
                <textarea
                  required
                  rows={3}
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  placeholder="Brief synopsis that will appear on the insights grid..."
                  className="admin-textarea"
                />
              </div>

              <div className="admin-row-2 admin-form-group">
                <div>
                  <label className="admin-label">
                    External Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={articleForm.linkUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">
                    Media / Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={articleForm.mediaUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, mediaUrl: e.target.value })}
                    placeholder="/uploads/filename.jpg or https://..."
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-info-box" style={{ margin: '16px 0' }}>
                <div style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>30-Day Automated Lifecycle Guarantee</span>
                </div>
                <span>
                  This article will be live on the site starting immediately and will expire and be automatically removed after exactly 30 days. You can extend or delete it at any time.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="btn outline"
                  style={{ fontSize: '0.74rem', padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingArticle}
                  className="btn"
                  style={{ fontSize: '0.74rem', padding: '9px 18px' }}
                >
                  {creatingArticle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish Article ↗</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
