export interface Article {
  id: string;
  title: string;
  category: string;
  tag: string;
  summary: string;
  content?: string;
  linkUrl?: string;
  mediaUrl?: string;
  createdAt: string; // ISO String
  expiresAt: string; // ISO String: automatically set to +30 days
  viewCount?: number;
}

export type MediaType = 'image' | 'video' | 'document' | 'link';

export interface MediaItem {
  id: string;
  title: string;
  filename?: string;
  url: string;
  type: MediaType;
  size?: number;
  mimeType?: string;
  imagekitFileId?: string;
  storageProvider?: 'imagekit' | 'local' | 'external';
  createdAt: string;
}

export interface CommunityApplication {
  id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  message: string;
  agreeToContact: boolean;
  createdAt: string;
  emailSent: boolean;
  emailStatusMessage?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

export interface DatabaseSchema {
  admins: AdminUser[];
  articles: Article[];
  media: MediaItem[];
  applications: CommunityApplication[];
  stats: {
    expiredArticlesPurged: number;
    totalApplications: number;
  };
}

export interface AuthSession {
  id: string;
  username: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}
