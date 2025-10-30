// Email templates for contact form notifications

export const emailTemplates = {
  'admin-notification': {
    subject: 'New Advertising Inquiry - {{adType}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Advertising Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #667eea; }
          .message-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Advertising Inquiry</h1>
            <p>Someone is interested in advertising with Yuumpy!</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Contact Information:</div>
              <div class="value">
                <strong>Name:</strong> {{name}}<br>
                <strong>Email:</strong> {{email}}<br>
                <strong>Company:</strong> {{company}}<br>
                <strong>Phone:</strong> {{phone}}
              </div>
            </div>
            
            <div class="field">
              <div class="label">Advertising Type:</div>
              <div class="value">{{adType}}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">{{message}}</div>
            </div>
            
            <div class="field">
              <div class="label">Submitted:</div>
              <div class="value">{{submittedAt}}</div>
            </div>
          </div>
          <div class="footer">
            <p>This inquiry was submitted through the Yuumpy advertising contact form.</p>
            <p>Please respond to the customer within 24 hours for the best experience.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Advertising Inquiry - {{adType}}

Contact Information:
Name: {{name}}
Email: {{email}}
Company: {{company}}
Phone: {{phone}}

Advertising Type: {{adType}}

Message:
{{message}}

Submitted: {{submittedAt}}

---
This inquiry was submitted through the Yuumpy advertising contact form.
Please respond to the customer within 24 hours for the best experience.
    `
  },

  'user-confirmation': {
    subject: 'Thank you for your advertising inquiry - Yuumpy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for your inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0; }
          .cta { text-align: center; margin: 30px 0; }
          .cta a { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You, {{name}}!</h1>
            <p>We've received your advertising inquiry</p>
          </div>
          <div class="content">
            <p>Hi {{name}},</p>
            
            <p>Thank you for your interest in advertising with Yuumpy! We're excited about the possibility of working with you.</p>
            
            <div class="highlight">
              <h3>Your Inquiry Details:</h3>
              <p><strong>Advertising Type:</strong> {{adType}}</p>
              <p>We've received your message and will review your requirements carefully.</p>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll prepare a customized advertising proposal for you</li>
              <li>You'll receive a detailed response with pricing and options</li>
              <li>We'll schedule a call to discuss your specific needs</li>
            </ul>
            
            <div class="cta">
              <a href="mailto:{{supportEmail}}">Contact Us Directly</a>
            </div>
            
            <p>In the meantime, feel free to explore our website to learn more about Yuumpy and our advertising opportunities.</p>
            
            <p>Best regards,<br>
            The Yuumpy Team</p>
          </div>
          <div class="footer">
            <p>This email was sent in response to your advertising inquiry.</p>
            <p>If you have any questions, please contact us at {{supportEmail}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Thank You, {{name}}!

We've received your advertising inquiry

Hi {{name}},

Thank you for your interest in advertising with Yuumpy! We're excited about the possibility of working with you.

Your Inquiry Details:
Advertising Type: {{adType}}

We've received your message and will review your requirements carefully.

What happens next?
- Our team will review your inquiry within 24 hours
- We'll prepare a customized advertising proposal for you
- You'll receive a detailed response with pricing and options
- We'll schedule a call to discuss your specific needs

Contact us directly: {{supportEmail}}

In the meantime, feel free to explore our website to learn more about Yuumpy and our advertising opportunities.

Best regards,
The Yuumpy Team

---
This email was sent in response to your advertising inquiry.
If you have any questions, please contact us at {{supportEmail}}
    `
  }
};

// Helper function to replace template variables
export function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  return result;
}
