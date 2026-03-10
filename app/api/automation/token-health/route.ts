import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

/**
 * GET /api/automation/token-health
 * Check health of all OAuth tokens and send alerts for expiring tokens
 * Should be called daily via cron
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
  
  // Verify cron authorization
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const level2Config = await kvStorage.getLevel2Config();
    const alerts: Array<{platform: string; status: string; daysUntilExpiry?: number}> = [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check each platform's token expiry
    for (const [platform, config] of Object.entries(level2Config)) {
      if (!config.enabled) continue;

      const validatedAt = config.validatedAt;
      if (!validatedAt) {
        alerts.push({
          platform,
          status: 'never-validated',
        });
        continue;
      }

      const validatedDate = new Date(validatedAt).getTime();
      const daysSinceValidation = Math.floor((now - validatedDate) / oneDayMs);

      // LinkedIn tokens expire after 60 days
      if (platform === 'linkedin') {
        const daysUntilExpiry = 60 - daysSinceValidation;
        
        if (daysUntilExpiry <= 0) {
          alerts.push({
            platform,
            status: 'expired',
            daysUntilExpiry: 0
          });
          
          // Disable platform automatically
          await kvStorage.saveCredentials(
            2, 
            platform, 
            config.credentials, 
            false, // Disable
            false  // Mark as unvalidated
          );
        } else if (daysUntilExpiry <= 7) {
          alerts.push({
            platform,
            status: 'expiring-soon',
            daysUntilExpiry
          });
        } else if (daysUntilExpiry <= 14) {
          alerts.push({
            platform,
            status: 'expiring-warning',
            daysUntilExpiry
          });
        }
      }

      // Add checks for other platforms with token expiry here
    }

    // Send email notifications for critical alerts
    if (alerts.some(a => a.status === 'expired' || a.status === 'expiring-soon')) {
      if (!RESEND_API_KEY || !ADMIN_EMAIL) {
        console.warn('⚠️ Email alerts skipped: RESEND_API_KEY or ADMIN_EMAIL not configured');
      } else {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://v2u.us';
        
        let emailBody = '<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">\n';
        emailBody += '<h2 style="color: #dc3545;">🚨 OAuth Token Alert</h2>\n\n';
        emailBody += '<p style="font-size: 16px;">The following social media platforms need attention:</p>\n\n';
        emailBody += '<ul style="font-size: 16px; line-height: 1.8;">\n';
        
        for (const alert of alerts) {
          if (alert.status === 'expired') {
            emailBody += `<li><strong style="color: #dc3545;">${alert.platform.toUpperCase()}</strong>: ❌ Token EXPIRED - posting disabled</li>\n`;
          } else if (alert.status === 'expiring-soon') {
            emailBody += `<li><strong style="color: #ffc107;">${alert.platform.toUpperCase()}</strong>: ⚠️ Token expires in ${alert.daysUntilExpiry} days</li>\n`;
          } else if (alert.status === 'expiring-warning') {
            emailBody += `<li><strong>${alert.platform.toUpperCase()}</strong>: ⏰ Token expires in ${alert.daysUntilExpiry} days</li>\n`;
          }
        }
        
        emailBody += '</ul>\n\n';
        emailBody += `<div style="margin: 30px 0; text-align: center;"><a href="${appUrl}/api/linkedin/quick-reauth" style="background: #0077B5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">🔄 Re-Authenticate LinkedIn Now</a></div>\n\n`;
        emailBody += '<p style="font-size: 16px;"><strong>What to do:</strong></p>\n';
        emailBody += '<ol style="line-height: 1.8; font-size: 15px;">\n';
        emailBody += '  <li>Click the button above (or visit /admin/automation)</li>\n';
        emailBody += '  <li>Authorize the app again through LinkedIn</li>\n';
        emailBody += '  <li>New token will be automatically saved</li>\n';
        emailBody += '  <li>Posting will resume immediately</li>\n';
        emailBody += '</ol>\n\n';
        emailBody += '<p style="color: #666; font-size: 14px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">This is an automated alert from your V2U automation system.</p>';
        emailBody += '</div>';

        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: EMAIL_FROM,
              to: [ADMIN_EMAIL],
              subject: '🚨 Social Media Token Expiring - Action Required',
              html: emailBody
            })
          });

          if (emailResponse.ok) {
            console.log('✅ Token expiry alert email sent successfully');
          } else {
            console.error('❌ Failed to send alert email:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('❌ Error sending alert email:', emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      alerts,
      summary: {
        total: Object.keys(level2Config).length,
        expired: alerts.filter(a => a.status === 'expired').length,
        expiringSoon: alerts.filter(a => a.status === 'expiring-soon').length,
        expiringWarning: alerts.filter(a => a.status === 'expiring-warning').length,
        neverValidated: alerts.filter(a => a.status === 'never-validated').length
      }
    });

  } catch (error) {
    console.error('Token health check error:', error);
    return NextResponse.json(
      { 
        error: 'Token health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
