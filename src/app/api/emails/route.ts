import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for emails (in production, use a database)
const emailStorage: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // Return all stored emails
    return NextResponse.json({
      success: true,
      data: emailStorage.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new email entry
    const newEmail = {
      id: Date.now(),
      ...body,
      created_at: new Date().toISOString(),
      status: 'new'
    };
    
    // Add to storage
    emailStorage.push(newEmail);
    
    console.log('Email stored:', newEmail);
    
    return NextResponse.json({
      success: true,
      data: newEmail
    });
  } catch (error: any) {
    console.error('Error storing email:', error);
    return NextResponse.json(
      { error: 'Failed to store email', details: error.message },
      { status: 500 }
    );
  }
}
