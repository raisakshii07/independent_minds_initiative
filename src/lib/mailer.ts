import nodemailer from 'nodemailer';
import { CommunityApplication } from './types';

const ADMIN_EMAIL = 'Independentminds.in@gmail.com';

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export async function sendApplicationEmail(
  app: CommunityApplication
): Promise<{ success: boolean; message: string }> {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #071727; color: #f4eddf; margin: 0; padding: 30px 15px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #0c2033; border: 1px solid rgba(217, 189, 120, 0.35); border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background-color: #10283d; padding: 25px 30px; border-bottom: 2px solid #d9bd78; }
        .header h1 { margin: 0; color: #d9bd78; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .header p { margin: 6px 0 0; color: #b4c0c8; font-size: 13px; }
        .content { padding: 30px; }
        .badge { display: inline-block; padding: 4px 10px; background-color: rgba(217,189,120,0.15); border: 1px solid #d9bd78; color: #d9bd78; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
        .field { margin-bottom: 18px; }
        .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #d9bd78; font-weight: 700; margin-bottom: 4px; }
        .value { font-size: 15px; color: #f4eddf; line-height: 1.5; background: #071727; padding: 10px 14px; border: 1px solid rgba(244,237,223,0.12); }
        .message-box { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
        .footer { background: #071727; padding: 20px 30px; text-align: center; border-top: 1px solid rgba(244,237,223,0.12); font-size: 12px; color: #8797a4; }
        .button { display: inline-block; margin-top: 15px; padding: 11px 20px; background-color: #d9bd78; color: #102033; font-weight: 700; text-decoration: none; border-radius: 3px; font-size: 13px; letter-spacing: 0.05em; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>✦ Independent Minds Initiative</h1>
          <p>New Community Application Received</p>
        </div>
        <div class="content">
          <span class="badge">Application #${app.id.substring(4)}</span>

          <div class="field">
            <div class="label">Applicant Name</div>
            <div class="value"><strong>${app.name}</strong></div>
          </div>

          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${app.email}" style="color:#d9bd78; text-decoration:none;">${app.email}</a></div>
          </div>

          <div class="field">
            <div class="label">City / State</div>
            <div class="value">${app.city || 'Not provided'}</div>
          </div>

          <div class="field">
            <div class="label">Interested In / Role</div>
            <div class="value"><strong>${app.role}</strong></div>
          </div>

          <div class="field">
            <div class="label">Motivation & Message</div>
            <div class="value message-box">${app.message ? app.message.replace(/</g, '&lt;') : 'No extra message entered.'}</div>
          </div>

          <div class="field">
            <div class="label">Received At</div>
            <div class="value">${new Date(app.createdAt).toLocaleString()}</div>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${app.email}?subject=Welcome%20to%20Independent%20Minds%20Initiative" class="button">
              Reply to ${app.name} ↗
            </a>
          </div>
        </div>
        <div class="footer">
          Delivered automatically to <strong>${ADMIN_EMAIL}</strong><br>
          Independent Minds Initiative Community Portal
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[MAIL NOTIFICATION] SMTP credentials not configured yet. Application logged: ${app.name} (${app.email}) -> target: ${ADMIN_EMAIL}`);
    return {
      success: true,
      message: 'Application recorded. Set SMTP_USER and SMTP_PASS in .env to deliver live emails.',
    };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"Independent Minds Initiative" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: ADMIN_EMAIL,
      replyTo: app.email,
      subject: `[IMI Community] Application: ${app.name} (${app.role})`,
      html: htmlContent,
      text: `New application received for Independent Minds Initiative:\n\nName: ${app.name}\nEmail: ${app.email}\nCity: ${app.city}\nRole: ${app.role}\nMessage: ${app.message}\nDate: ${new Date(app.createdAt).toLocaleString()}`,
    });

    return { success: true, message: `Email delivered to ${ADMIN_EMAIL}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send application email:', errorMsg);
    return { success: false, message: errorMsg };
  }
}

export async function sendTestEmail(): Promise<{ success: boolean; message: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      message: 'SMTP is not configured. Please add SMTP_USER and SMTP_PASS to .env file.',
    };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"Independent Minds Initiative" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: ADMIN_EMAIL,
      subject: '✦ [IMI Test] SMTP Configuration Verified',
      html: `<div style="padding:20px; font-family:sans-serif; background:#071727; color:#f4eddf;">
        <h2 style="color:#d9bd78;">Independent Minds Initiative</h2>
        <p>Your SMTP email configuration is active and working properly.</p>
        <p>All future community applications will be delivered to <strong>${ADMIN_EMAIL}</strong>.</p>
      </div>`,
    });
    return { success: true, message: `Test email sent successfully to ${ADMIN_EMAIL}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
}
