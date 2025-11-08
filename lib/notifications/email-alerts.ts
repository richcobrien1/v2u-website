/**
 * Email Alert System for Automation Failures
 * Sends notifications when social media posting fails
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rich@v2u.us';
const FROM_EMAIL = process.env.FROM_EMAIL || 'alerts@v2u.us';

interface FailureReport {
  timestamp: string;
  contentTitle: string;
  contentUrl: string;
  contentSource: string; // 'youtube', 'rumble', 'spotify'
  failures: {
    platform: string;
    error: string;
  }[];
  successes: string[];
}

/**
 * Send email alert when posting fails
 */
export async function sendFailureAlert(report: FailureReport): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured, skipping email alert');
    return;
  }

  try {
    const emailHtml = generateFailureEmailHtml(report);
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Social Media Posting Failed - ${report.contentTitle}`,
      html: emailHtml,
    });

    console.log('✅ Failure alert email sent');
  } catch (error) {
    console.error('❌ Failed to send email alert:', error);
    // Don't throw - email failure shouldn't break the automation
  }
}

/**
 * Generate HTML email for failure report
 */
function generateFailureEmailHtml(report: FailureReport): string {
  const failureRows = report.failures
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${f.platform}</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;">${f.error}</td>
      </tr>
    `
    )
    .join('');

  const successBadges = report.successes
    .map((s) => `<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">${s}</span>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Posting Failure Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Social Media Posting Failed</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0;">Content Details</h2>
          <p><strong>Title:</strong> ${report.contentTitle}</p>
          <p><strong>Source:</strong> ${report.contentSource.toUpperCase()}</p>
          <p><strong>URL:</strong> <a href="${report.contentUrl}">${report.contentUrl}</a></p>
          <p><strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="margin-top: 0; color: #dc2626;">Failed Platforms (${report.failures.length})</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Platform</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Error</th>
              </tr>
            </thead>
            <tbody>
              ${failureRows}
            </tbody>
          </table>
        </div>

        ${
          report.successes.length > 0
            ? `
        <div style="background: #f0fdf4; padding: 20px; border: 1px solid #bbf7d0; border-top: none;">
          <h2 style="margin-top: 0; color: #10b981;">Successful Posts (${report.successes.length})</h2>
          <div>${successBadges}</div>
        </div>
        `
            : ''
        }

        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This is an automated alert from your V2U Social Media Automation system.
            <br>
            <a href="https://www.v2u.us/admin/social-posting" style="color: #2563eb;">View Admin Dashboard</a>
          </p>
        </div>
      </body>
    </html>
  `;
}
