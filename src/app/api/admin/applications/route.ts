import { NextRequest, NextResponse } from 'next/server';
import { getApplications } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifyAdminRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const applications = await getApplications();
    return NextResponse.json({ applications });
  } catch (err: unknown) {
    console.error('Error fetching applications:', err);
    return NextResponse.json({ error: 'Failed to fetch applications.' }, { status: 500 });
  }
}
