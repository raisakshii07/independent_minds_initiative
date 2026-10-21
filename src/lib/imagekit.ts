import ImageKit from 'imagekit';

function getImageKitInstance(): ImageKit | null {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY?.trim() &&
      process.env.IMAGEKIT_PRIVATE_KEY?.trim() &&
      process.env.IMAGEKIT_URL_ENDPOINT?.trim()
  );
}

export async function uploadBufferToImageKit(
  buffer: Buffer,
  filename: string,
  folder = '/independent_minds_media'
): Promise<{ url: string; fileId: string; size: number; fileType: string; thumbnailUrl?: string }> {
  const ik = getImageKitInstance();
  if (!ik) {
    throw new Error(
      'ImageKit credentials missing. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env.local.'
    );
  }

  const response = await ik.upload({
    file: buffer,
    fileName: filename,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: response.url,
    fileId: response.fileId,
    size: response.size,
    fileType: response.fileType,
    thumbnailUrl: response.thumbnailUrl,
  };
}

export async function deleteFromImageKit(fileId: string): Promise<boolean> {
  const ik = getImageKitInstance();
  if (!ik || !fileId) return false;

  try {
    await ik.deleteFile(fileId);
    return true;
  } catch (err) {
    console.error('Failed to delete file from ImageKit:', err);
    return false;
  }
}
