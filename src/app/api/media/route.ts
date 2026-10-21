import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMediaItems, addMediaItem } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { MediaType } from '@/lib/types';
import { runMulterSingle } from '@/lib/multer';
import { isImageKitConfigured, uploadBufferToImageKit } from '@/lib/imagekit';

export async function GET() {
  try {
    const items = await getMediaItems();
    return NextResponse.json({
      media: items,
      imagekitActive: isImageKitConfigured(),
    });
  } catch (err: unknown) {
    console.error('Error fetching media:', err);
    return NextResponse.json({ error: 'Failed to fetch media items.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  // Rate limiting on media uploads/links: 10 requests per second
  const limit = checkRateLimit(req, {
    windowMs: 1000,
    maxRequests: 10,
    actionName: 'media_upload',
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Upload rate limit reached. Please wait ${limit.resetInSeconds}s.` },
      { status: 429 }
    );
  }

  const contentType = req.headers.get('content-type') || '';

  try {
    // 1. Single Media Upload via Multer & ImageKit
    if (contentType.includes('multipart/form-data')) {
      // Parse single file using Multer middleware
      const { file, body } = await runMulterSingle(req);

      if (!file) {
        return NextResponse.json({ error: 'No media file received by Multer parser.' }, { status: 400 });
      }

      const title = body.title?.trim() || file.originalname;
      const customType = (body.type as MediaType) || undefined;

      let detectedType: MediaType = 'document';
      if (file.mimetype.startsWith('image/')) detectedType = 'image';
      else if (file.mimetype.startsWith('video/')) detectedType = 'video';
      else if (customType) detectedType = customType;

      // Primary: ImageKit Cloud Media CDN
      if (isImageKitConfigured()) {
        try {
          const ikResult = await uploadBufferToImageKit(file.buffer, file.originalname);
          const mediaItem = await addMediaItem({
            title,
            filename: file.originalname,
            url: ikResult.url,
            imagekitFileId: ikResult.fileId,
            storageProvider: 'imagekit',
            type: detectedType,
            size: ikResult.size || file.size,
            mimeType: file.mimetype,
          });

          return NextResponse.json({
            success: true,
            message: 'Single media successfully uploaded to ImageKit CDN via Multer.',
            media: mediaItem,
          });
        } catch (ikErr: unknown) {
          const msg = ikErr instanceof Error ? ikErr.message : String(ikErr);
          console.error('ImageKit error, falling back to local storage:', msg);
        }
      }

      // Fallback: Local Server Storage if ImageKit credentials are not yet set in .env
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${Date.now()}-${sanitizedOriginal}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      fs.writeFileSync(filePath, file.buffer);

      const mediaItem = await addMediaItem({
        title,
        filename: uniqueFilename,
        url: `/uploads/${uniqueFilename}`,
        storageProvider: 'local',
        type: detectedType,
        size: file.size,
        mimeType: file.mimetype,
      });

      return NextResponse.json({
        success: true,
        message:
          'Media processed via Multer (stored locally). Add ImageKit keys to .env.local to enable direct ImageKit CDN hosting.',
        media: mediaItem,
      });
    }

    // 2. JSON Body (Sharing External Link, YouTube, Document Link)
    const body = await req.json();
    const { title, url, type } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required.' }, { status: 400 });
    }

    const mediaItem = await addMediaItem({
      title: title.trim(),
      url: url.trim(),
      type: (type as MediaType) || 'link',
      storageProvider: 'external',
    });

    return NextResponse.json({
      success: true,
      message: 'Media link shared successfully.',
      media: mediaItem,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error uploading/adding media via Multer & ImageKit:', errorMsg);
    return NextResponse.json({ error: `Media upload error: ${errorMsg}` }, { status: 500 });
  }
}
