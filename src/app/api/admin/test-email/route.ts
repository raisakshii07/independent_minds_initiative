import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/mailer';
import { verifyAdminRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const result = await sendTestEmail();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: unknown) {
    console.error('Error sending test email:', err);
    return NextResponse.json({ error: 'Failed to dispatch test email.' }, { status: 500 });
  }
}
