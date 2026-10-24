import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { DatabaseSchema, Article, MediaItem, CommunityApplication, AdminUser } from './types';
import { deleteFromImageKit } from './imagekit';
import { connectToDatabase, isMongoDbConfigured } from './mongodb';
import { ArticleModel } from '@/models/Article';
import { MediaModel } from '@/models/Media';
import { ApplicationModel } from '@/models/Application';
import { AdminModel } from '@/models/Admin';
import { SystemMetaModel } from '@/models/SystemMeta';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_BACKUP_FILE = path.join(DATA_DIR, 'db.backup.json');

const DEFAULT_EXPIRATION_DAYS = 30;

// Mutex lock to prevent concurrent write collisions on local fallback
let isWriting = false;
const writeQueue: Array<() => void> = [];

async function acquireLock(): Promise<void> {
  if (!isWriting) {
    isWriting = true;
    return;
  }
  return new Promise((resolve) => {
    writeQueue.push(() => {
      isWriting = true;
      resolve();
    });
  });
}

function releaseLock(): void {
  if (writeQueue.length > 0) {
    const next = writeQueue.shift();
    if (next) next();
  } else {
    isWriting = false;
  }
}

// Initial seed articles matching the original HTML content
const SEED_ARTICLES: Omit<Article, 'id' | 'createdAt' | 'expiresAt'>[] = [
  {
    title: 'How geography shapes global power',
    category: 'geopolitics',
    tag: 'Geopolitics · Explainer',
    summary: 'Explore how location, resources, trade routes, and borders influence the choices nations make.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Geopolitics%20insights',
  },
  {
    title: 'What makes a society thrive?',
    category: 'society',
    tag: 'Society · Perspective',
    summary: 'A look at trust, institutions, education, shared spaces, and the everyday forces that shape social life.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Society%20insights',
  },
  {
    title: 'Economics beyond the headlines',
    category: 'economics',
    tag: 'Economics · Basics',
    summary: 'Understand inflation, jobs, growth, inequality, and how economic choices affect daily life.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Economics%20insights',
  },
  {
    title: 'How businesses turn ideas into value',
    category: 'business',
    tag: 'Business · Ideas',
    summary: 'Learn about entrepreneurship, strategy, innovation, markets, and the decisions behind organizations.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Business%20insights',
  },
  {
    title: 'Why the past still matters',
    category: 'history',
    tag: 'History · Context',
    summary: "Use historical patterns and turning points to better understand today's institutions and debates.",
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=History%20insights',
  },
  {
    title: 'Technology changing the human story',
    category: 'science',
    tag: 'Science & Technology · Discovery',
    summary: 'Explore emerging technologies, scientific breakthroughs, and the questions they raise for society.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Science%20and%20technology%20insights',
  },
  {
    title: 'Climate, cities, and shared responsibility',
    category: 'environment',
    tag: 'Climate & Environment · Future',
    summary: 'Connect sustainability with energy, urban life, public choices, and the future we build together.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Climate%20insights',
  },
  {
    title: 'How public decisions get made',
    category: 'politics',
    tag: 'Politics & Governance · Civics',
    summary: 'Understand institutions, public policy, citizen participation, and the systems that shape everyday life.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Governance%20insights',
  },
  {
    title: 'How to think clearly about difficult questions',
    category: 'philosophy',
    tag: 'Philosophy & Ideas · Reflection',
    summary: 'Practice examining assumptions, weighing arguments, and engaging with ideas beyond easy answers.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Philosophy%20insights',
  },
  {
    title: 'Who shapes the stories we believe?',
    category: 'culture',
    tag: 'Culture & Media · Perspective',
    summary: 'Explore media literacy, culture, narratives, and how information influences the way we see the world.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Culture%20and%20media%20insights',
  },
  {
    title: 'Curiosity as a lifelong skill',
    category: 'personal',
    tag: 'Psychology & Personal Growth · Learning',
    summary: 'Discover how habits, motivation, attention, and reflection can help us keep learning and growing.',
    linkUrl: 'mailto:Independentminds.in@gmail.com?subject=Psychology%20insights',
  },
];

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -------------------------------------------------------------
// MongoDB Auto-Seed & Migration Initializer
// -------------------------------------------------------------
let mongoSeeded = false;
async function ensureMongoSeed(): Promise<void> {
  if (mongoSeeded) return;
  try {
    // 1. Check if already seeded/migrated in MongoDB meta collection
    const meta = await SystemMetaModel.findOne({ key: 'system_init' });
    if (meta && meta.isSeeded) {
      mongoSeeded = true;
      return;
    }

    // 2. Ensure Admin exists in MongoDB
    const adminCount = await AdminModel.countDocuments();
    if (adminCount === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword!2026#';
      const defaultUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(defaultPassword, salt);
      await AdminModel.create({
        username: defaultUsername,
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
      });
    }

    // 3. Check if local data/db.json or backup exists to dump into MongoDB
    const sourceFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(DB_BACKUP_FILE) ? DB_BACKUP_FILE : null);
    if (sourceFile) {
      try {
        const raw = fs.readFileSync(sourceFile, 'utf8');
        const dbData = JSON.parse(raw);

        // Migrate articles from db.json
        if (Array.isArray(dbData.articles) && dbData.articles.length > 0) {
          for (const a of dbData.articles) {
            const exists = await ArticleModel.findOne({
              $or: [{ customId: a.id }, { title: a.title }],
            });
            if (!exists) {
              await ArticleModel.create({
                customId: a.id,
                title: a.title,
                category: a.category,
                tag: a.tag || `${a.category.toUpperCase()} · Insight`,
                summary: a.summary,
                content: a.content || '',
                linkUrl: a.linkUrl || '',
                mediaUrl: a.mediaUrl || '',
                createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
                expiresAt: a.expiresAt
                  ? new Date(a.expiresAt)
                  : new Date(Date.now() + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
                viewCount: a.viewCount || 0,
              });
            }
          }
        }

        // Migrate media from db.json
        if (Array.isArray(dbData.media) && dbData.media.length > 0) {
          for (const m of dbData.media) {
            const exists = await MediaModel.findOne({
              $or: [{ customId: m.id }, { url: m.url }],
            });
            if (!exists) {
              await MediaModel.create({
                customId: m.id,
                title: m.title,
                filename: m.filename,
                url: m.url,
                type: m.type || 'image',
                size: m.size,
                mimeType: m.mimeType,
                createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
              });
            }
          }
        }

        // Migrate applications from db.json
        if (Array.isArray(dbData.applications) && dbData.applications.length > 0) {
          for (const app of dbData.applications) {
            const exists = await ApplicationModel.findOne({
              $or: [{ customId: app.id }, { email: app.email }],
            });
            if (!exists) {
              await ApplicationModel.create({
                customId: app.id,
                name: app.name,
                email: app.email,
                city: app.city || '',
                role: app.role || 'Joining the community',
                message: app.message || '',
                agreeToContact: Boolean(app.agreeToContact),
                emailSent: Boolean(app.emailSent),
                createdAt: app.createdAt ? new Date(app.createdAt) : new Date(),
              });
            }
          }
        }

        // Clean up db.json if present
        if (fs.existsSync(DB_FILE)) {
          try {
            fs.unlinkSync(DB_FILE);
            console.log('[Migration] Dumped data/db.json into MongoDB and deleted db.json successfully.');
          } catch (unlinkErr) {
            console.warn('[Migration] Could not unlink db.json:', unlinkErr);
          }
        }
      } catch (migrateErr) {
        console.error('[Migration] Error migrating db.json into MongoDB:', migrateErr);
      }
    } else {
      // If no db.json, check if initial seed is needed for fresh DB
      const articleCount = await ArticleModel.countDocuments();
      if (articleCount === 0) {
        const now = Date.now();
        const docs = SEED_ARTICLES.map((art, i) => ({
          ...art,
          createdAt: new Date(now - i * 60 * 1000),
          expiresAt: new Date(now + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
        }));
        await ArticleModel.insertMany(docs);
      }
    }

    // 4. Mark system initialization as completed in MongoDB (prevents deleted articles from resurrecting)
    await SystemMetaModel.updateOne(
      { key: 'system_init' },
      { $set: { key: 'system_init', isSeeded: true, migratedAt: new Date(), version: 1 } },
      { upsert: true }
    );

    mongoSeeded = true;
  } catch (err) {
    console.error('Error during MongoDB auto-seeding:', err);
  }
}

// -------------------------------------------------------------
// Local JSON Storage Helpers (Fallback)
// -------------------------------------------------------------
function getInitialDatabase(): DatabaseSchema {
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword!2026#';
  const defaultUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultPassword, salt);

  const admin: AdminUser = {
    id: 'admin_root',
    username: defaultUsername,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  // If MongoDB is configured, do not re-create seed articles on empty local fallback
  if (isMongoDbConfigured()) {
    return {
      admins: [admin],
      articles: [],
      media: [],
      applications: [],
      stats: {
        expiredArticlesPurged: 0,
        totalApplications: 0,
      },
    };
  }

  const now = Date.now();
  const articles: Article[] = SEED_ARTICLES.map((item, index) => {
    const createdAt = new Date(now - index * 60 * 1000).toISOString();
    const expiresAt = new Date(now + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    return {
      ...item,
      id: `art_${Date.now()}_${index}`,
      createdAt,
      expiresAt,
    };
  });

  return {
    admins: [admin],
    articles,
    media: [],
    applications: [],
    stats: {
      expiredArticlesPurged: 0,
      totalApplications: 0,
    },
  };
}

export async function readDb(): Promise<DatabaseSchema> {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    if (!isMongoDbConfigured()) {
      await writeDbDirect(initial);
    }
    return initial;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data: DatabaseSchema = JSON.parse(content);

    // Auto-purge any articles expired past their 30 days timeout
    const now = Date.now();
    const activeArticles = data.articles.filter(
      (a) => new Date(a.expiresAt).getTime() > now
    );
    const expiredCount = data.articles.length - activeArticles.length;

    if (expiredCount > 0) {
      data.articles = activeArticles;
      data.stats.expiredArticlesPurged = (data.stats.expiredArticlesPurged || 0) + expiredCount;
      await writeDbDirect(data);
    }

    return data;
  } catch (err) {
    console.error('Error reading db.json, recreating fallback:', err);
    const fallback = getInitialDatabase();
    if (!isMongoDbConfigured()) {
      await writeDbDirect(fallback);
    }
    return fallback;
  }
}

async function writeDbDirect(data: DatabaseSchema): Promise<void> {
  ensureDataDirectory();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await acquireLock();
  try {
    await writeDbDirect(data);
  } finally {
    releaseLock();
  }
}

// -------------------------------------------------------------
// Articles Management (With 30-Day Auto Timeout & Expiration)
// -------------------------------------------------------------

export async function getActiveArticles(category?: string): Promise<Article[]> {
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      await ensureMongoSeed();
      const filter: Record<string, unknown> = {
        expiresAt: { $gt: new Date() },
      };
      if (category && category !== 'all') {
        filter.category = category.toLowerCase();
      }

      const docs = await ArticleModel.find(filter).sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({
        id: d.customId || String(d._id),
        title: d.title,
        category: d.category,
        tag: d.tag,
        summary: d.summary,
        content: d.content,
        linkUrl: d.linkUrl,
        mediaUrl: d.mediaUrl,
        createdAt: new Date(d.createdAt).toISOString(),
        expiresAt: new Date(d.expiresAt).toISOString(),
        viewCount: d.viewCount,
      }));
    }
  }

  // Local fallback
  const db = await readDb();
  let list = db.articles;
  if (category && category !== 'all') {
    list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllArticlesAdmin(): Promise<{ articles: Article[]; purgedCount: number }> {
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      await ensureMongoSeed();
      const docs = await ArticleModel.find({}).sort({ createdAt: -1 }).lean();
      const articles: Article[] = docs.map((d) => ({
        id: d.customId || String(d._id),
        title: d.title,
        category: d.category,
        tag: d.tag,
        summary: d.summary,
        content: d.content,
        linkUrl: d.linkUrl,
        mediaUrl: d.mediaUrl,
        createdAt: new Date(d.createdAt).toISOString(),
        expiresAt: new Date(d.expiresAt).toISOString(),
        viewCount: d.viewCount,
      }));

      return {
        articles,
        purgedCount: 0,
      };
    }
  }

  // Local fallback
  const db = await readDb();
  return {
    articles: db.articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    purgedCount: db.stats.expiredArticlesPurged || 0,
  };
}

export async function createArticle(
  data: Omit<Article, 'id' | 'createdAt' | 'expiresAt'> & { expirationDays?: number }
): Promise<Article> {
  const days = data.expirationDays || DEFAULT_EXPIRATION_DAYS;
  const now = Date.now();
  const expiresAtDate = new Date(now + days * 24 * 60 * 60 * 1000);
  const customId = `art_${now}_${Math.random().toString(36).substring(2, 7)}`;

  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      await ensureMongoSeed();
      const created = await ArticleModel.create({
        customId,
        title: data.title,
        category: data.category,
        tag: data.tag || `${data.category.toUpperCase()} · Insight`,
        summary: data.summary,
        content: data.content || '',
        linkUrl: data.linkUrl || '',
        mediaUrl: data.mediaUrl || '',
        createdAt: new Date(now),
        expiresAt: expiresAtDate,
        viewCount: 0,
      });

      return {
        id: created.customId || String(created._id),
        title: created.title,
        category: created.category,
        tag: created.tag,
        summary: created.summary,
        content: created.content,
        linkUrl: created.linkUrl,
        mediaUrl: created.mediaUrl,
        createdAt: new Date(created.createdAt).toISOString(),
        expiresAt: new Date(created.expiresAt).toISOString(),
        viewCount: created.viewCount,
      };
    }
  }

  // Local fallback
  const db = await readDb();
  const newArticle: Article = {
    id: customId,
    title: data.title,
    category: data.category,
    tag: data.tag || `${data.category.toUpperCase()} · Insight`,
    summary: data.summary,
    content: data.content || '',
    linkUrl: data.linkUrl || '',
    mediaUrl: data.mediaUrl || '',
    createdAt: new Date(now).toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    viewCount: 0,
  };

  db.articles.unshift(newArticle);
  if (fs.existsSync(DB_FILE)) {
    await writeDb(db);
  }
  return newArticle;
}

export async function renewArticleExpiration(id: string, days = DEFAULT_EXPIRATION_DAYS): Promise<Article | null> {
  const newExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await ArticleModel.findByIdAndUpdate(
          id,
          { expiresAt: newExpiresAt },
          { new: true }
        ).lean();
      }
      if (!updated) {
        updated = await ArticleModel.findOneAndUpdate(
          { customId: id },
          { expiresAt: newExpiresAt },
          { new: true }
        ).lean();
      }

      if (!updated) return null;
      return {
        id: updated.customId || String(updated._id),
        title: updated.title,
        category: updated.category,
        tag: updated.tag,
        summary: updated.summary,
        content: updated.content,
        linkUrl: updated.linkUrl,
        mediaUrl: updated.mediaUrl,
        createdAt: new Date(updated.createdAt).toISOString(),
        expiresAt: new Date(updated.expiresAt).toISOString(),
        viewCount: updated.viewCount,
      };
    }
  }

  // Local fallback
  const db = await readDb();
  const article = db.articles.find((a) => a.id === id);
  if (!article) return null;

  article.expiresAt = newExpiresAt.toISOString();
  if (fs.existsSync(DB_FILE)) {
    await writeDb(db);
  }
  return article;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await ArticleModel.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await ArticleModel.findOneAndDelete({ customId: id });
      }
      if (deleted) {
        return true;
      }
    }
  }

  // Local fallback
  const db = await readDb();
  const initialLength = db.articles.length;
  db.articles = db.articles.filter((a) => a.id !== id);
  if (db.articles.length !== initialLength) {
    if (fs.existsSync(DB_FILE)) {
      await writeDb(db);
    }
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// Media & Link Management
// -------------------------------------------------------------

export async function getMediaItems(): Promise<MediaItem[]> {
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await MediaModel.find({}).sort({ createdAt: -1 }).lean();
      return docs.map((m) => ({
        id: m.customId || String(m._id),
        title: m.title,
        filename: m.filename,
        url: m.url,
        type: m.type,
        size: m.size,
        mimeType: m.mimeType,
        imagekitFileId: m.imagekitFileId,
        storageProvider: m.storageProvider,
        createdAt: new Date(m.createdAt).toISOString(),
      }));
    }
  }

  // Local fallback
  const db = await readDb();
  return db.media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addMediaItem(
  item: Omit<MediaItem, 'id' | 'createdAt'>
): Promise<MediaItem> {
  const customId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      const created = await MediaModel.create({
        customId,
        ...item,
        createdAt: new Date(),
      });

      return {
        id: created.customId || String(created._id),
        title: created.title,
        filename: created.filename,
        url: created.url,
        type: created.type,
        size: created.size,
        mimeType: created.mimeType,
        imagekitFileId: created.imagekitFileId,
        storageProvider: created.storageProvider,
        createdAt: new Date(created.createdAt).toISOString(),
      };
    }
  }

  // Local fallback
  const db = await readDb();
  const newItem: MediaItem = {
    ...item,
    id: customId,
    createdAt: new Date().toISOString(),
  };

  db.media.unshift(newItem);
  if (fs.existsSync(DB_FILE)) {
    await writeDb(db);
  }
  return newItem;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  let itemToDelete: { imagekitFileId?: string; filename?: string; type?: string } | null = null;

  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      let found = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        found = await MediaModel.findById(id);
      }
      if (!found) {
        found = await MediaModel.findOne({ customId: id });
      }

      if (found) {
        itemToDelete = {
          imagekitFileId: found.imagekitFileId,
          filename: found.filename,
          type: found.type,
        };
        await MediaModel.deleteOne({ _id: found._id });
      }
    }
  } else {
    const db = await readDb();
    const item = db.media.find((m) => m.id === id);
    if (item) {
      itemToDelete = {
        imagekitFileId: item.imagekitFileId,
        filename: item.filename,
        type: item.type,
      };
      db.media = db.media.filter((m) => m.id !== id);
      if (fs.existsSync(DB_FILE)) {
        await writeDb(db);
      }
    }
  }

  if (!itemToDelete) return false;

  // If ImageKit asset, remove from ImageKit
  if (itemToDelete.imagekitFileId) {
    try {
      await deleteFromImageKit(itemToDelete.imagekitFileId);
    } catch (err) {
      console.warn('Could not delete from ImageKit:', err);
    }
  }

  // If local file, optionally delete from disk
  if (itemToDelete.filename) {
    const filePath = path.join(process.cwd(), 'public', 'uploads', itemToDelete.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete physical media file:', err);
      }
    }
  }

  return true;
}

// -------------------------------------------------------------
// Community Applications
// -------------------------------------------------------------

export async function addApplication(
  data: Omit<CommunityApplication, 'id' | 'createdAt'>
): Promise<CommunityApplication> {
  const customId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      const created = await ApplicationModel.create({
        customId,
        ...data,
        createdAt: new Date(),
      });

      return {
        id: created.customId || String(created._id),
        name: created.name,
        email: created.email,
        city: created.city,
        role: created.role,
        message: created.message,
        agreeToContact: created.agreeToContact,
        emailSent: created.emailSent,
        emailStatusMessage: created.emailStatusMessage,
        createdAt: new Date(created.createdAt).toISOString(),
      };
    }
  }

  // Local fallback
  const db = await readDb();
  const newApp: CommunityApplication = {
    ...data,
    id: customId,
    createdAt: new Date().toISOString(),
  };

  db.applications.unshift(newApp);
  db.stats.totalApplications = (db.stats.totalApplications || 0) + 1;
  if (fs.existsSync(DB_FILE)) {
    await writeDb(db);
  }
  return newApp;
}

export async function getApplications(): Promise<CommunityApplication[]> {
  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await ApplicationModel.find({}).sort({ createdAt: -1 }).lean();
      return docs.map((a) => ({
        id: a.customId || String(a._id),
        name: a.name,
        email: a.email,
        city: a.city,
        role: a.role,
        message: a.message,
        agreeToContact: a.agreeToContact,
        emailSent: a.emailSent,
        emailStatusMessage: a.emailStatusMessage,
        createdAt: new Date(a.createdAt).toISOString(),
      }));
    }
  }

  // Local fallback
  const db = await readDb();
  return db.applications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// -------------------------------------------------------------
// Admin User Management
// -------------------------------------------------------------

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  const normalizedUser = username.trim().toLowerCase();
  const defaultUser = (process.env.ADMIN_DEFAULT_USERNAME || 'admin').trim().toLowerCase();

  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      await ensureMongoSeed();
      const admin = await AdminModel.findOne({ username: normalizedUser }).lean();
      if (admin) {
        return {
          id: String(admin._id),
          username: admin.username,
          passwordHash: admin.passwordHash,
          role: admin.role,
          createdAt: new Date(admin.createdAt).toISOString(),
        };
      }
    }
  }

  // Local fallback
  const db = await readDb();
  let admin = db.admins.find((a) => a.username.toLowerCase() === normalizedUser);
  if (!admin && normalizedUser === defaultUser) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword!2026#';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(defaultPassword, salt);
    admin = {
      id: 'admin_root',
      username: defaultUser,
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    if (fs.existsSync(DB_FILE)) {
      db.admins.push(admin);
      await writeDb(db);
    }
  }
  return admin || null;
}

export async function updateAdminPassword(username: string, newPassword: string): Promise<boolean> {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  if (isMongoDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      const res = await AdminModel.findOneAndUpdate(
        { username: username.toLowerCase() },
        { passwordHash }
      );
      return Boolean(res);
    }
  }

  // Local fallback
  const db = await readDb();
  const admin = db.admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
  if (!admin) return false;

  admin.passwordHash = passwordHash;
  if (fs.existsSync(DB_FILE)) {
    await writeDb(db);
  }
  return true;
}
