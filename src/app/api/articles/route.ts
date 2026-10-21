import { NextRequest, NextResponse } from 'next/server';
import { getActiveArticles, getAllArticlesAdmin, createArticle } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const adminMode = searchParams.get('adminMode') === 'true';

    if (adminMode) {
      const session = await verifyAdminRequest(req);
      if (session) {
        const adminData = await getAllArticlesAdmin();
        return NextResponse.json({
          articles: adminData.articles,
          purgedCount: adminData.purgedCount,
        });
      }
    }

    const articles = await getActiveArticles(category);
    return NextResponse.json({ articles });
  } catch (err: unknown) {
    console.error('Error fetching articles:', err);
    return NextResponse.json({ error: 'Failed to fetch articles.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  // Rate limit: 10 requests per second
  const limit = checkRateLimit(req, {
    windowMs: 1000,
    maxRequests: 10,
    actionName: 'article_create',
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Please wait ${limit.resetInSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { title, category, tag, summary, content, linkUrl, mediaUrl, expirationDays } = body;

    if (!title || !category || !summary) {
      return NextResponse.json(
        { error: 'Title, category, and summary are required fields.' },
        { status: 400 }
      );
    }

    const newArticle = await createArticle({
      title: title.trim(),
      category: category.trim(),
      tag: tag ? tag.trim() : `${category.toUpperCase()} · Insight`,
      summary: summary.trim(),
      content: content ? content.trim() : '',
      linkUrl: linkUrl ? linkUrl.trim() : '',
      mediaUrl: mediaUrl ? mediaUrl.trim() : '',
      expirationDays: expirationDays ? Number(expirationDays) : 30, // Default 30 days
    });

    return NextResponse.json({
      success: true,
      message: 'Article published with 30-day automatic expiration.',
      article: newArticle,
    });
  } catch (err: unknown) {
    console.error('Error creating article:', err);
    return NextResponse.json({ error: 'Failed to create article.' }, { status: 500 });
  }
}
