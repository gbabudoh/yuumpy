import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter for testing
function createTransporter(secureOverride?: boolean) {
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = secureOverride !== undefined ? secureOverride : (process.env.SMTP_SECURE === 'true');
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure, // true for 465, false for 587 (STARTTLS)
    requireTLS: port === 587, // Require TLS upgrade for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Do not fail on invalid certificates (useful for self-signed certs)
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  });
}

// Test SMTP connection
async function testSMTPConnection(tryBoth: boolean = false) {
  const results: any = {};
  
  // Test with configured secure setting
  try {
    const transporter = createTransporter();
    await transporter.verify();
    results.primary = { 
      success: true, 
      message: 'SMTP connection successful',
      secure: process.env.SMTP_SECURE === 'true',
      port: process.env.SMTP_PORT || '587'
    };
  } catch (error: any) {
    results.primary = { 
      success: false, 
      message: 'SMTP connection failed', 
      error: error.message,
      secure: process.env.SMTP_SECURE === 'true',
      port: process.env.SMTP_PORT || '587'
    };
    
    // If failed and using port 587, try with opposite secure setting
    if (tryBoth && process.env.SMTP_PORT === '587') {
      try {
        const altSecure = process.env.SMTP_SECURE !== 'true';
        const transporter = createTransporter(altSecure);
        await transporter.verify();
        results.alternative = {
          success: true,
          message: `SMTP connection successful with secure=${altSecure}`,
          secure: altSecure,
          port: '587',
          note: 'Try updating SMTP_SECURE to match this setting'
        };
      } catch (altError: any) {
        results.alternative = {
          success: false,
          message: 'Alternative configuration also failed',
          error: altError.message,
          secure: !(process.env.SMTP_SECURE === 'true'),
          port: '587'
        };
      }
    }
  }
  
  return results;
}

// Send test email
async function sendTestEmail(toEmail: string) {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM || 'orders@yuumpy.com';
    
    const testEmail = {
      from: `"Yuumpy Test" <${fromEmail}>`,
      to: toEmail,
      subject: '🧪 Test Email from Yuumpy - Email System Working!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Test Successful!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px;">Hello!</p>
            <p>This is a test email from the Yuumpy email system.</p>
            <p>If you're receiving this email, it means:</p>
            <ul style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <li>✅ SMTP server connection is working</li>
              <li>✅ Email authentication is successful</li>
              <li>✅ Email sending functionality is operational</li>
              <li>✅ The orders@yuumpy.com email address is configured correctly</li>
            </ul>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #065f46;">Email Configuration Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">SMTP Host:</td>
                  <td style="padding: 8px 0; text-align: right;">${process.env.SMTP_HOST || 'Not set'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">SMTP Port:</td>
                  <td style="padding: 8px 0; text-align: right;">${process.env.SMTP_PORT || '587'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">From Email:</td>
                  <td style="padding: 8px 0; text-align: right;">${fromEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">To Email:</td>
                  <td style="padding: 8px 0; text-align: right;">${toEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Test Time:</td>
                  <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent automatically by the Yuumpy email testing system.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              © ${new Date().getFullYear()} Yuumpy. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Email Test Successful!

This is a test email from the Yuumpy email system.

If you're receiving this email, it means:
- SMTP server connection is working
- Email authentication is successful
- Email sending functionality is operational
- The orders@yuumpy.com email address is configured correctly

Email Configuration:
- SMTP Host: ${process.env.SMTP_HOST || 'Not set'}
- SMTP Port: ${process.env.SMTP_PORT || '587'}
- From Email: ${fromEmail}
- To Email: ${toEmail}
- Test Time: ${new Date().toLocaleString()}

This email was sent automatically by the Yuumpy email testing system.
      `,
    };

    const info = await transporter.sendMail(testEmail);
    
    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      response: info.response
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      code: error.code
    };
  }
}

// GET - Test email configuration and connection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testConnection = searchParams.get('test_connection') === 'true';
    const sendTest = searchParams.get('send_test') === 'true';
    const toEmail = searchParams.get('to') || 'orders@yuumpy.com';

    const results: any = {
      timestamp: new Date().toISOString(),
      configuration: {
        smtpHost: process.env.SMTP_HOST || 'Not configured',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpSecure: process.env.SMTP_SECURE === 'true',
        smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'Not configured',
        smtpFrom: process.env.SMTP_FROM || 'orders@yuumpy.com',
        adminOrderEmails: process.env.ADMIN_ORDER_EMAILS || 'orders@yuumpy.com,payments@egobas.com',
      },
      tests: {}
    };

    // Test SMTP connection
    if (testConnection) {
      const tryBoth = searchParams.get('try_both') === 'true';
      results.tests.connection = await testSMTPConnection(tryBoth);
    }

    // Send test email
    if (sendTest) {
      results.tests.sendEmail = await sendTestEmail(toEmail);
    }

    // If no specific test requested, just return configuration
    if (!testConnection && !sendTest) {
      return NextResponse.json({
        message: 'Email test endpoint. Use ?test_connection=true to test SMTP connection, or ?send_test=true to send a test email.',
        ...results
      });
    }

    // Add troubleshooting information
    if (results.tests?.connection?.primary?.success === false) {
      results.troubleshooting = {
        issue: 'Connection refused',
        possibleCauses: [
          'Mail server only accepts connections from localhost (VPS itself)',
          'Port 587 is blocked by firewall',
          'Mail server restricts connections to specific IP addresses',
          'Network connectivity issue between your location and the VPS'
        ],
        solutions: [
          'If testing from local machine: The mail server may only accept connections from the VPS. Try testing from the VPS itself.',
          'Check firewall rules: Ensure port 587 is open for outbound connections',
          'Check mail server configuration: Verify it accepts external connections',
          'Test from VPS: SSH into your VPS and test from there using: curl http://localhost:3000/api/test-email?send_test=true&to=orders@yuumpy.com'
        ]
      };
    }

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Send test email with custom data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    const toEmail = to || 'orders@yuumpy.com';
    const emailSubject = subject || '🧪 Test Email from Yuumpy';
    const emailMessage = message || 'This is a test email from the Yuumpy email system.';

    const result = await sendTestEmail(toEmail);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: error.message
      },
      { status: 500 }
    );
  }
}

