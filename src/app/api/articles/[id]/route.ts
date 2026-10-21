import { NextRequest, NextResponse } from 'next/server';
import { deleteArticle, renewArticleExpiration } from '@/lib/db';
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
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err: unknown) {
    console.error('Error deleting article:', err);
    return NextResponse.json({ error: 'Failed to delete article.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const days = body.days ? Number(body.days) : 30;

    const renewed = await renewArticleExpiration(id, days);
    if (!renewed) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Article expiration extended by ${days} days.`,
      article: renewed,
    });
  } catch (err: unknown) {
    console.error('Error renewing article:', err);
    return NextResponse.json({ error: 'Failed to renew article expiration.' }, { status: 500 });
  }
}
