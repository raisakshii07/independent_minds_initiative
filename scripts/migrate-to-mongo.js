/**
 * Migration Script: Dumps data/db.json into MongoDB Atlas and deletes db.json
 * Usage: node scripts/migrate-to-mongo.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local or .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[Error] MONGODB_URI is not set in environment or .env.local');
  process.exit(1);
}

const DB_JSON_PATH = path.join(process.cwd(), 'data', 'db.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'db.backup.json');

async function runMigration() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'independent_minds',
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    console.log('✓ Successfully connected to MongoDB (database: independent_minds)');
  } catch (err) {
    console.error('✗ Connection to MongoDB Atlas failed:', err.message);
    console.error('\nNOTE: If you see "Could not connect to any servers in your MongoDB Atlas cluster":');
    console.error('1. Log into MongoDB Atlas (https://cloud.mongodb.com)');
    console.error('2. Go to "Network Access" in the sidebar');
    console.error('3. Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('4. Re-run: npm run migrate:mongo\n');
    process.exit(1);
  }

  const sourcePath = fs.existsSync(DB_JSON_PATH) ? DB_JSON_PATH : (fs.existsSync(BACKUP_PATH) ? BACKUP_PATH : null);

  if (!sourcePath) {
    console.log('[Info] No db.json or db.backup.json found. Database is already running purely on MongoDB.');
    await mongoose.disconnect();
    process.exit(0);
  }

  let dbData;
  try {
    const raw = fs.readFileSync(sourcePath, 'utf8');
    dbData = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ Failed to parse ${sourcePath}:`, err.message);
    await mongoose.disconnect();
    process.exit(1);
  }

  const db = mongoose.connection.db;

  // 1. Migrate Admin Users
  if (Array.isArray(dbData.admins) && dbData.admins.length > 0) {
    const adminsCol = db.collection('admins');
    for (const a of dbData.admins) {
      const existing = await adminsCol.findOne({ username: a.username });
      if (!existing) {
        await adminsCol.insertOne({
          username: a.username,
          passwordHash: a.passwordHash,
          role: a.role || 'admin',
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        });
        console.log(`✓ Migrated admin: ${a.username}`);
      } else {
        // Sync password hash
        await adminsCol.updateOne({ username: a.username }, { $set: { passwordHash: a.passwordHash } });
        console.log(`✓ Updated admin credentials: ${a.username}`);
      }
    }
  }

  // 2. Migrate Articles
  if (Array.isArray(dbData.articles) && dbData.articles.length > 0) {
    const articlesCol = db.collection('articles');
    let insertedArticles = 0;
    for (const art of dbData.articles) {
      const existing = await articlesCol.findOne({
        $or: [
          { customId: art.id },
          { title: art.title }
        ]
      });
      if (!existing) {
        await articlesCol.insertOne({
          customId: art.id,
          title: art.title,
          category: art.category,
          tag: art.tag || `${art.category.toUpperCase()} · Insight`,
          summary: art.summary,
          content: art.content || '',
          linkUrl: art.linkUrl || '',
          mediaUrl: art.mediaUrl || '',
          createdAt: art.createdAt ? new Date(art.createdAt) : new Date(),
          expiresAt: art.expiresAt ? new Date(art.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          viewCount: art.viewCount || 0,
        });
        insertedArticles++;
      }
    }
    console.log(`✓ Migrated ${insertedArticles} articles to MongoDB articles collection.`);
  }

  // 3. Migrate Media
  if (Array.isArray(dbData.media) && dbData.media.length > 0) {
    const mediaCol = db.collection('media');
    let insertedMedia = 0;
    for (const m of dbData.media) {
      const existing = await mediaCol.findOne({
        $or: [
          { customId: m.id },
          { url: m.url }
        ]
      });
      if (!existing) {
        await mediaCol.insertOne({
          customId: m.id,
          title: m.title,
          filename: m.filename,
          url: m.url,
          type: m.type || 'image',
          size: m.size,
          mimeType: m.mimeType,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        });
        insertedMedia++;
      }
    }
    console.log(`✓ Migrated ${insertedMedia} media items to MongoDB media collection.`);
  }

  // 4. Migrate Applications
  if (Array.isArray(dbData.applications) && dbData.applications.length > 0) {
    const appsCol = db.collection('applications');
    let insertedApps = 0;
    for (const app of dbData.applications) {
      const existing = await appsCol.findOne({
        $or: [
          { customId: app.id },
          { email: app.email }
        ]
      });
      if (!existing) {
        await appsCol.insertOne({
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
        insertedApps++;
      }
    }
    console.log(`✓ Migrated ${insertedApps} applications to MongoDB applications collection.`);
  }

  // 5. Mark System Initialization Meta
  const metaCol = db.collection('systemmetas');
  await metaCol.updateOne(
    { key: 'system_init' },
    {
      $set: {
        key: 'system_init',
        isSeeded: true,
        migratedAt: new Date(),
        version: 1,
      }
    },
    { upsert: true }
  );
  console.log('✓ Marked system initialization state (deleted articles will never resurrect).');

  // 6. Delete db.json (preserving backup just in case)
  try {
    fs.copyFileSync(DB_JSON_PATH, BACKUP_PATH);
    fs.unlinkSync(DB_JSON_PATH);
    console.log(`✓ Deleted data/db.json (backup created at ${path.basename(BACKUP_PATH)}).`);
  } catch (err) {
    console.warn('Could not delete data/db.json:', err.message);
  }

  console.log('\n🎉 SUCCESS: All data dumped into MongoDB Atlas database "independent_minds"!');
  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
