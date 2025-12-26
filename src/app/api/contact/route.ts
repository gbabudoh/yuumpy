import { NextRequest, NextResponse } from 'next/server';
import { sendContactAdminNotification, sendContactUserConfirmation } from '@/lib/email';

// Function to save email locally for admin panel
async function saveEmailLocally(contactData: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' },
      body: JSON.stringify(contactData) });

    if (!response.ok) {
      console.error('Failed to save email locally:', response.status, response.statusText);
    } else {
      console.log('Email saved locally for admin panel');
    }
  } catch (error) {
    console.error('Error saving email locally:', error);
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

    // Save to local storage for admin panel
    await saveEmailLocally(contactData);
    
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

  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve contact submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement admin authentication check
    // TODO: Retrieve contact submissions from database
    
    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error: any) {
    console.error('Error retrieving contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
