import { NextRequest, NextResponse } from 'next/server';
import { deleteMediaItem } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteMediaItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Media item deleted successfully.' });
  } catch (err: unknown) {
    console.error('Error deleting media:', err);
    return NextResponse.json({ error: 'Failed to delete media item.' }, { status: 500 });
  }
}
