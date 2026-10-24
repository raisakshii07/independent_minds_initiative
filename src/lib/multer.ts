import { NextRequest } from 'next/server';
import multer from 'multer';
import { Readable } from 'stream';

// Multer memory storage configuration for single media upload
const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1, // Single media upload enforcement
  },
  fileFilter: (_req, file, cb) => {
    // Whitelist safe media & document mime types
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
      'text/plain',
    ];
    if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Only images, videos, audio, and documents are permitted.`));
    }
  },
});

export const singleMediaUpload = multerUpload.single('file');

export interface MulterParseResult {
  file?: Express.Multer.File;
  body: Record<string, string>;
}

/**
 * Runs Multer single file upload middleware on a Next.js App Router Request
 */
export async function runMulterSingle(req: NextRequest): Promise<MulterParseResult> {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data for media upload.');
  }

  // Convert NextRequest body buffer to Node readable stream
  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  // Attach headers required by Multer's Busboy parser
  const mockReq = Object.assign(stream, {
    headers: {
      'content-type': contentType,
      'content-length': String(buffer.length),
    },
    method: req.method,
    file: undefined as Express.Multer.File | undefined,
    body: {} as Record<string, string>,
  });

  const mockRes = {};

  return new Promise((resolve, reject) => {
    singleMediaUpload(mockReq as unknown as Parameters<typeof singleMediaUpload>[0], mockRes as Parameters<typeof singleMediaUpload>[1], (err: unknown) => {
      if (err) {
        return reject(err);
      }
      resolve({
        file: mockReq.file,
        body: mockReq.body || {},
      });
    });
  });
}
