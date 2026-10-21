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
      <div className="min-h-screen bg-[#071727] text-[#f4eddf] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#d9bd78]" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  // Render Login Modal / View if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#071727] text-[#f4eddf] flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-[#10283d] border border-[rgba(244,237,223,0.17)] p-8 shadow-2xl relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[#d9bd78] flex items-center justify-center text-[#d9bd78] font-serif text-xl shrink-0">
              ✦
            </div>
            <div>
              <div className="text-sm font-bold tracking-widest text-[#d9bd78] uppercase leading-tight m-0">
                Independent Minds
              </div>
              <div className="text-[10px] tracking-wider text-[#b4c0c8] uppercase mt-0.5">
                Admin Control Portal
              </div>
            </div>
          </div>

          <div className="text-xs text-[#b4c0c8] mb-6 text-center">
            Sign in with administrative privileges to manage articles, 30-day
            expiration schedules, media assets, and view community applications.
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full btn flex items-center justify-center gap-2"
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

          <div className="mt-6 pt-4 border-t border-[rgba(244,237,223,0.1)] text-[11px] text-[#8fa3b0] space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#d9bd78]" />
              <span>JWT Authentication &amp; Sliding Window Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#d9bd78]" />
              <span>Default initial credentials: <strong>admin</strong> / <strong>AdminPassword!2026#</strong></span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-[#b4c0c8] hover:text-[#d9bd78] underline">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#071727] text-[#f4eddf]">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 border shadow-xl flex items-center gap-3 text-xs max-w-md transition-all ${
            notification.type === 'error'
              ? 'bg-[#2b0e0e] border-red-500 text-red-200'
              : 'bg-[#10283d] border-[#d9bd78] text-[#f4eddf]'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#d9bd78] shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="border-b border-[rgba(244,237,223,0.17)] bg-[#0c2033]/90 backdrop-blur sticky top-0 z-40">
        <div className="wrap flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#d9bd78] flex items-center justify-center text-[#d9bd78] font-serif">
              ✦
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-[#d9bd78] uppercase">
                Independent Minds Initiative
              </div>
              <div className="text-[10px] text-[#b4c0c8] flex items-center gap-2">
                <span>ADMIN PORTAL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400">JWT Authenticated ({currentUser})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#b4c0c8] hover:text-[#d9bd78] flex items-center gap-1.5 border border-[rgba(244,237,223,0.15)] px-3 py-1.5"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1.5 border border-red-900/50 bg-red-950/30 px-3 py-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="wrap flex border-t border-[rgba(244,237,223,0.08)] overflow-x-auto">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'articles'
                ? 'border-[#d9bd78] text-[#d9bd78] bg-[rgba(217,189,120,0.05)]'
                : 'border-transparent text-[#b4c0c8] hover:text-[#f4eddf]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Articles &amp; 30-Day Timeout ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'media'
                ? 'border-[#d9bd78] text-[#d9bd78] bg-[rgba(217,189,120,0.05)]'
                : 'border-transparent text-[#b4c0c8] hover:text-[#f4eddf]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Media &amp; Links ({mediaItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'applications'
                ? 'border-[#d9bd78] text-[#d9bd78] bg-[rgba(217,189,120,0.05)]'
                : 'border-transparent text-[#b4c0c8] hover:text-[#f4eddf]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Community Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-[#d9bd78] text-[#d9bd78] bg-[rgba(217,189,120,0.05)]'
                : 'border-transparent text-[#b4c0c8] hover:text-[#f4eddf]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Settings &amp; Email Engine</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="wrap py-8">
        {/* ============================================================== */}
        {/* TAB 1: ARTICLES MANAGEMENT WITH 30-DAY TIMEOUT                */}
        {/* ============================================================== */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0c2033] p-5 border border-[rgba(244,237,223,0.1)]">
              <div>
                <h2 className="text-xl font-serif text-[#f4eddf] m-0">
                  Insights &amp; Knowledge Articles
                </h2>
                <p className="text-xs text-[#b4c0c8] m-0 mt-1">
                  Every published article features an automatic <strong>30-day expiration timer</strong>. Expired articles are automatically purged from the public site.
                </p>
                {purgedCount > 0 && (
                  <div className="text-[11px] text-[#d9bd78] mt-1 font-mono">
                    ✦ {purgedCount} past expired articles automatically cleaned by system
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadDashboardData}
                  className="btn outline text-xs py-2 px-3 flex items-center gap-1.5"
                  title="Refresh articles"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="btn text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Article</span>
                </button>
              </div>
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#10283d] border border-[rgba(244,237,223,0.12)] p-5 flex flex-col justify-between hover:border-[#d9bd78]/40 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#d9bd78]">
                        {art.tag}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#071727] border border-[#d9bd78]/30 text-[#d9bd78] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(art.expiresAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif mb-2 leading-snug">{art.title}</h3>
                    <p className="text-xs text-[#b4c0c8] mb-4 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>

                    {art.mediaUrl && (
                      <div className="text-[11px] text-[#b4c0c8] truncate mb-3 bg-[#071727] p-1.5 border border-[#314659]">
                        Attached Media: <span className="text-[#d9bd78]">{art.mediaUrl}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[rgba(244,237,223,0.08)] flex justify-between items-center text-xs">
                    <button
                      onClick={() => handleRenewArticle(art.id)}
                      className="text-[#d9bd78] hover:text-[#f0d89a] flex items-center gap-1 cursor-pointer font-bold"
                      title="Extend article expiration by another 30 days"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>+30 Days</span>
                    </button>

                    <button
                      onClick={() => handleDeleteArticle(art.id, art.title)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
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
              <div className="text-center py-12 bg-[#0c2033] border border-[rgba(244,237,223,0.1)]">
                <FileText className="w-10 h-10 text-[#d9bd78]/40 mx-auto mb-3" />
                <h3 className="text-base font-serif mb-1">No Active Articles</h3>
                <p className="text-xs text-[#b4c0c8] max-w-sm mx-auto mb-4">
                  All active articles are displayed here. Click &quot;Publish New Article&quot; to add content with a 30-day automatic timeout.
                </p>
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="btn text-xs py-2 px-4"
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
          <div className="space-y-6">
            {/* Media Upload Box */}
            <div className="bg-[#10283d] border border-[rgba(244,237,223,0.17)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-serif text-[#f4eddf] m-0">
                    Upload Media &amp; Share Links
                  </h2>
                  <p className="text-[11px] text-[#d9bd78] m-0 mt-0.5 font-mono">
                    ✦ Multer Parser + ImageKit CDN (Single Media Upload)
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaUploadType('file')}
                    className={`px-3 py-1.5 border cursor-pointer ${
                      mediaUploadType === 'file'
                        ? 'border-[#d9bd78] bg-[#d9bd78]/10 text-[#d9bd78]'
                        : 'border-[#314659] text-[#b4c0c8]'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaUploadType('link')}
                    className={`px-3 py-1.5 border cursor-pointer ${
                      mediaUploadType === 'link'
                        ? 'border-[#d9bd78] bg-[#d9bd78]/10 text-[#d9bd78]'
                        : 'border-[#314659] text-[#b4c0c8]'
                    }`}
                  >
                    Share External Link
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMedia} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                    Title / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="e.g. Geopolitics Map 2026 or Research Paper PDF"
                    className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                  />
                </div>

                {mediaUploadType === 'file' ? (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                      Choose File (Images, PDF, Videos up to 25MB)
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full bg-[#0a1c2d] border border-[#314659] p-2 text-xs text-[#b4c0c8] file:mr-4 file:py-1 file:px-3 file:border file:border-[#d9bd78] file:bg-[#d9bd78] file:text-[#071727] file:font-bold file:text-xs cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                        URL / Link
                      </label>
                      <input
                        type="url"
                        required
                        value={mediaLinkUrl}
                        onChange={(e) => setMediaLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                        Link Category
                      </label>
                      <select
                        value={mediaLinkCategory}
                        onChange={(e) =>
                          setMediaLinkCategory(e.target.value as 'link' | 'video' | 'document')
                        }
                        className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
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
                  className="btn text-xs py-2 px-4 flex items-center gap-2"
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
            <div className="bg-[#0c2033] border border-[rgba(244,237,223,0.1)] p-5">
              <h3 className="text-base font-serif mb-4 flex items-center justify-between">
                <span>Stored Media &amp; Shared Links</span>
                <span className="text-xs text-[#b4c0c8] font-sans font-normal">
                  {mediaItems.length} items registered
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#10283d] border border-[#314659] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#d9bd78] uppercase mb-2">
                        {item.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-[#d9bd78]" />
                        ) : item.type === 'document' ? (
                          <FileText className="w-4 h-4 text-[#d9bd78]" />
                        ) : (
                          <LinkIcon className="w-4 h-4 text-[#d9bd78]" />
                        )}
                        <span>{item.type}</span>
                      </div>

                      <h4 className="text-sm font-semibold mb-1 truncate" title={item.title}>
                        {item.title}
                      </h4>

                      {item.url && item.type === 'image' && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-32 object-cover border border-[#314659] my-2"
                        />
                      )}

                      <div className="text-[11px] font-mono text-[#b4c0c8] truncate bg-[#071727] p-2 border border-[#314659] my-2">
                        {item.url}
                      </div>

                      <div className="text-[10px] text-[#8fa3b0]">
                        Added on {new Date(item.createdAt).toLocaleDateString()}
                        {item.size ? ` · ${(item.size / 1024).toFixed(1)} KB` : ''}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[rgba(244,237,223,0.08)] flex justify-between items-center text-xs">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="text-[#d9bd78] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMedia(item.id, item.title)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {mediaItems.length === 0 && (
                <div className="text-center py-8 text-xs text-[#b4c0c8]">
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
          <div className="space-y-6">
            <div className="bg-[#0c2033] border border-[rgba(244,237,223,0.1)] p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-serif text-[#f4eddf] m-0">
                  Community Applications &amp; Responses
                </h2>
                <p className="text-xs text-[#b4c0c8] m-0 mt-1">
                  All submissions are automatically routed to{' '}
                  <strong className="text-[#d9bd78]">independentmindsinitiative@gmail.com</strong> and archived here.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="btn outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#10283d] border border-[rgba(244,237,223,0.12)] p-5 hover:border-[#d9bd78]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#f4eddf]">{app.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#d9bd78]/15 border border-[#d9bd78] text-[#d9bd78]">
                        {app.role}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8fa3b0]">
                      {new Date(app.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3 text-[#b4c0c8]">
                    <div>
                      <span className="text-[#d9bd78] font-bold">Email:</span>{' '}
                      <a
                        href={`mailto:${app.email}?subject=Independent Minds Initiative Community`}
                        className="underline hover:text-[#d9bd78]"
                      >
                        {app.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-[#d9bd78] font-bold">Location:</span>{' '}
                      {app.city || 'Not provided'}
                    </div>
                  </div>

                  {app.message && (
                    <div className="bg-[#071727] border border-[#314659] p-3 text-xs text-[#f4eddf] my-3 whitespace-pre-wrap leading-relaxed">
                      {app.message}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(244,237,223,0.08)] text-xs">
                    <div className="flex items-center gap-2 text-[11px]">
                      {app.emailSent ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Dispatched to independentmindsinitiative@gmail.com</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Archived in database (SMTP notification ready)</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={`mailto:${app.email}?subject=Welcome%20to%20Independent%20Minds%20Initiative`}
                      className="btn text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply Directly ↗</span>
                    </a>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12 bg-[#0c2033] border border-[rgba(244,237,223,0.1)]">
                  <Mail className="w-10 h-10 text-[#d9bd78]/40 mx-auto mb-3" />
                  <h3 className="text-base font-serif mb-1">No Applications Received Yet</h3>
                  <p className="text-xs text-[#b4c0c8]">
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
          <div className="space-y-6">
            <div className="bg-[#10283d] border border-[rgba(244,237,223,0.17)] p-6">
              <h2 className="text-lg font-serif text-[#f4eddf] mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#d9bd78]" />
                <span>Email Engine &amp; Notification Configuration</span>
              </h2>
              <p className="text-xs text-[#b4c0c8] mb-6">
                Community join responses are designated for delivery to{' '}
                <strong className="text-[#d9bd78]">independentmindsinitiative@gmail.com</strong>.
              </p>

              <div className="bg-[#071727] border border-[#314659] p-4 text-xs space-y-3 mb-6">
                <div className="font-bold text-[#d9bd78] uppercase tracking-wider text-[11px]">
                  Configuring Live Gmail SMTP Sending (.env.local):
                </div>
                <p className="text-[#b4c0c8]">
                  To send emails from your Google account using Nodemailer, generate a 16-character Google App Password:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#b4c0c8] ml-2">
                  <li>Visit your Google Account &gt; Security &gt; 2-Step Verification.</li>
                  <li>Scroll to the bottom and select <strong>App passwords</strong>.</li>
                  <li>Name it <em>&quot;Independent Minds Portal&quot;</em> and generate a 16-character code.</li>
                  <li>
                    Place these credentials in your local environment file (<code className="text-[#d9bd78]">.env.local</code>):
                  </li>
                </ol>

                <div className="bg-[#0c2033] p-3 font-mono text-[11px] text-[#f4eddf] border border-[#314659]">
                  SMTP_HOST=smtp.gmail.com<br />
                  SMTP_PORT=465<br />
                  SMTP_USER=independentmindsinitiative@gmail.com<br />
                  SMTP_PASS=your-16-char-app-password<br />
                  SMTP_FROM=&quot;Independent Minds Initiative&quot; &lt;independentmindsinitiative@gmail.com&gt;
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="btn text-xs py-2 px-4 flex items-center gap-2"
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
                <span className="text-xs text-[#8fa3b0]">
                  Sends a test message directly to independentmindsinitiative@gmail.com
                </span>
              </div>
            </div>

            {/* ImageKit Configuration Card */}
            <div className="bg-[#10283d] border border-[rgba(244,237,223,0.17)] p-6">
              <h2 className="text-lg font-serif text-[#f4eddf] mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#d9bd78]" />
                <span>ImageKit Media CDN &amp; Multer Integration</span>
              </h2>
              <p className="text-xs text-[#b4c0c8] mb-4">
                Media files are parsed with <strong>Multer</strong> (single media upload, max 25MB) and streamed to <strong>ImageKit Real-time CDN</strong>.
              </p>

              <div className="bg-[#071727] border border-[#314659] p-4 text-xs space-y-3">
                <div className="font-bold text-[#d9bd78] uppercase tracking-wider text-[11px]">
                  Setting up ImageKit in .env.local:
                </div>
                <p className="text-[#b4c0c8]">
                  Create a free ImageKit account at <a href="https://imagekit.io" target="_blank" rel="noopener noreferrer" className="text-[#d9bd78] underline">imagekit.io</a> (20GB free bandwidth/mo), copy your API keys from <em>Developer Options</em>, and add them to <code className="text-[#d9bd78]">.env.local</code>:
                </p>

                <div className="bg-[#0c2033] p-3 font-mono text-[11px] text-[#f4eddf] border border-[#314659]">
                  IMAGEKIT_PUBLIC_KEY=your_public_key<br />
                  IMAGEKIT_PRIVATE_KEY=your_private_key<br />
                  IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
                </div>

                <p className="text-[11px] text-[#8fa3b0]">
                  ✦ If ImageKit keys are not yet provided, Multer gracefully falls back to local server storage, so uploads never fail.
                </p>
              </div>
            </div>

            {/* Database Engine Card (MongoDB Atlas vs Local) */}
            <div className="bg-[#10283d] border border-[rgba(244,237,223,0.17)] p-6">
              <h2 className="text-lg font-serif text-[#f4eddf] mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d9bd78]" />
                <span>Database Engine (MongoDB Atlas Cloud Integration)</span>
              </h2>
              <p className="text-xs text-[#b4c0c8] mb-4">
                The application supports both <strong>MongoDB Atlas (Cloud Production)</strong> and local JSON persistence. For a live public site publishing articles daily and collecting applications, MongoDB Atlas is strongly recommended.
              </p>

              <div className="bg-[#071727] border border-[#314659] p-4 text-xs space-y-3">
                <div className="font-bold text-[#d9bd78] uppercase tracking-wider text-[11px]">
                  Connecting MongoDB Atlas (.env.local):
                </div>
                <p className="text-[#b4c0c8]">
                  1. Create a free M0 cluster at <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-[#d9bd78] underline">mongodb.com/cloud/atlas</a> (512MB free forever).<br />
                  2. Under <em>Database Access</em>, create a database user and password.<br />
                  3. Under <em>Network Access</em>, allow access from anywhere (<code className="text-[#d9bd78]">0.0.0.0/0</code>).<br />
                  4. Click <em>Connect &gt; Drivers</em> and copy the connection string into <code className="text-[#d9bd78]">.env.local</code>:
                </p>

                <div className="bg-[#0c2033] p-3 font-mono text-[11px] text-[#f4eddf] border border-[#314659]">
                  MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/independent_minds?retryWrites=true&amp;w=majority
                </div>

                <p className="text-[11px] text-[#8fa3b0]">
                  ✦ <strong>Native 30-Day TTL Index:</strong> MongoDB automatically purges articles older than 30 days at the database engine level via its native TTL index on <code>expiresAt</code>.
                </p>
              </div>
            </div>

            {/* Architecture & Security Info */}
            <div className="bg-[#0c2033] border border-[rgba(244,237,223,0.1)] p-6 space-y-4">
              <h3 className="text-base font-serif text-[#f4eddf] mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#d9bd78]" />
                <span>Security &amp; Scalability Architecture</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#10283d] p-4 border border-[#314659]">
                  <div className="font-bold text-[#d9bd78] mb-1">JWT Auth Protection</div>
                  <p className="text-[#b4c0c8]">
                    All admin mutations (media upload, deletion, article publishing, and applications viewing) are protected by cryptographic JSON Web Tokens signed with HMAC-SHA256 and stored in secure HttpOnly cookies.
                  </p>
                </div>

                <div className="bg-[#10283d] p-4 border border-[#314659]">
                  <div className="font-bold text-[#d9bd78] mb-1">Sliding-Window Rate Limiter</div>
                  <p className="text-[#b4c0c8]">
                    In-memory token bucket rate limiters set to 10 requests per second across login, media uploads, and public community forms to prevent denial-of-service and brute force while ensuring instant access.
                  </p>
                </div>

                <div className="bg-[#10283d] p-4 border border-[#314659]">
                  <div className="font-bold text-[#d9bd78] mb-1">30-Day Auto Timeout</div>
                  <p className="text-[#b4c0c8]">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10283d] border border-[#d9bd78] max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[rgba(244,237,223,0.1)]">
              <div>
                <h3 className="text-lg font-serif text-[#f4eddf] m-0">Publish New Article</h3>
                <p className="text-[11px] text-[#d9bd78] m-0">
                  ✦ Automatic 30-day deletion timer will be activated upon publication
                </p>
              </div>
              <button
                onClick={() => setShowArticleModal(false)}
                className="text-[#b4c0c8] hover:text-[#f4eddf] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Navigating Critical Thinking in the Age of Algorithmic Echo Chambers"
                  className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none capitalize"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                    Tag / Label
                  </label>
                  <input
                    type="text"
                    value={articleForm.tag}
                    onChange={(e) => setArticleForm({ ...articleForm, tag: e.target.value })}
                    placeholder="e.g. Geopolitics · Explainer"
                    className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                  Summary / Excerpt *
                </label>
                <textarea
                  required
                  rows={3}
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  placeholder="Brief synopsis that will appear on the insights grid..."
                  className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                    External Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={articleForm.linkUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#b4c0c8] font-bold mb-1">
                    Media / Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={articleForm.mediaUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, mediaUrl: e.target.value })}
                    placeholder="/uploads/filename.jpg or https://..."
                    className="w-full bg-[#0a1c2d] border border-[#314659] px-3 py-2 text-sm text-[#f4eddf] focus:border-[#d9bd78] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#071727] border border-[#d9bd78]/30 text-xs text-[#b4c0c8]">
                <div className="font-bold text-[#d9bd78] flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>30-Day Automated Lifecycle Guarantee</span>
                </div>
                <span>
                  This article will be live on the site starting immediately and will expire and be automatically removed after exactly 30 days. You can extend or delete it at any time.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="btn outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingArticle}
                  className="btn text-xs py-2 px-4 flex items-center gap-2"
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
