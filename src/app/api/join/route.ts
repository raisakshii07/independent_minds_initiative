import { NextRequest, NextResponse } from 'next/server';
import { addApplication } from '@/lib/db';
import { sendApplicationEmail } from '@/lib/mailer';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per second
  const limit = checkRateLimit(req, {
    windowMs: 1000,
    maxRequests: 10,
    actionName: 'community_join',
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `You have submitted multiple applications recently. Please wait ${limit.resetInSeconds} seconds before trying again.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, city, role, message, agreeToContact } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!agreeToContact) {
      return NextResponse.json(
        { error: 'Please agree to be contacted about Independent Minds Initiative activities.' },
        { status: 400 }
      );
    }

    // Save application to database first
    const application = await addApplication({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      city: city ? city.trim() : '',
      role: role || 'Joining the community',
      message: message ? message.trim() : '',
      agreeToContact: Boolean(agreeToContact),
      emailSent: false,
    });

    // Send email notification to independentmindsinitiative@gmail.com
    const emailResult = await sendApplicationEmail(application);
    application.emailSent = emailResult.success;
    application.emailStatusMessage = emailResult.message;

    return NextResponse.json({
      success: true,
      message:
        'Thank you! Your registration has been received. Our team will reach out to you shortly.',
      applicationId: application.id,
    });
  } catch (err: unknown) {
    console.error('Error handling community application:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your application.' },
      { status: 500 }
    );
  }
}
