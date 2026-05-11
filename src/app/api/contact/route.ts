import { NextRequest, NextResponse } from 'next/server';
import { sendContactAdminNotification, sendContactUserConfirmation } from '@/lib/email';
import { query } from '@/lib/database';

interface ContactData {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  ad_type: string;
  message: string;
  status: string;
  created_at?: string;
}

// Function to save contact submission to database
async function saveContactToDatabase(contactData: ContactData) {
  try {
    await query(
      `INSERT INTO contact_submissions (name, email, company, phone, ad_type, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        contactData.name,
        contactData.email,
        contactData.company,
        contactData.phone,
        contactData.ad_type,
        contactData.message,
        contactData.status
      ]
    );
    console.log('Contact submission saved to database');
  } catch (error) {
    console.error('Error saving contact to database:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, adType, message } = body;

    // Validate required fields
    if (!name || !email || !adType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create the contact record data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      ad_type: adType,
      message: message.trim(),
      created_at: new Date().toISOString(),
      status: 'new'
    };

    // Save to database
    await saveContactToDatabase(contactData);
    
    // Save to database (if you have a database setup)
    // await saveContactToDatabase(contactData);
    
    // Prepare contact form data for email
    const contactFormData = {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || undefined,
      phone: contactData.phone || undefined,
      adType: contactData.ad_type,
      message: contactData.message
    };
    
    // Send email notification to admin/support
    console.log('Sending admin notification email...');
    await sendContactAdminNotification(contactFormData).catch(err => 
      console.error('Failed to send admin notification email:', err)
    );
    
    // Send confirmation email to user
    console.log('Sending user confirmation email...');
    await sendContactUserConfirmation(email, name, adType).catch(err => 
      console.error('Failed to send user confirmation email:', err)
    );
    
    // Log the email for debugging (this will always show in console)
    const inquiryType = adType === 'customer-support' ? 'CUSTOMER SUPPORT INQUIRY' : 'ADVERTISING INQUIRY';
    console.log(`=== NEW ${inquiryType} ===`);
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Company:', company || 'Not provided');
    console.log('Phone:', phone || 'Not provided');
    console.log('Contact Type:', adType);
    console.log('Message:', message);
    console.log('Submitted:', contactData.created_at);
    console.log('================================');
    
    console.log('Contact form submission processed successfully:', {
      name,
      email,
      adType,
      timestamp: contactData.created_at
    });

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: Date.now(), // Temporary ID
        ...contactData
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET method to retrieve contact submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const token = request.cookies.get('adminAuth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Retrieve contact submissions from database
    const submissions = await query(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC'
    );
    
    return NextResponse.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Error retrieving contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
