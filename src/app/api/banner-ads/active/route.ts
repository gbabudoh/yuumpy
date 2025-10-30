import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yuumpy',
  port: parseInt(process.env.DB_PORT || '3306') };

export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Ensure the new columns exist
    try {
      await connection.execute(`
        ALTER TABLE banner_ads 
        ADD COLUMN IF NOT EXISTS expires_at DATETIME,
        ADD COLUMN IF NOT EXISTS duration VARCHAR(20),
        ADD COLUMN IF NOT EXISTS is_repeating BOOLEAN DEFAULT FALSE
      `);
    } catch (alterError) {
      // Columns might already exist, continue
      console.log('Columns might already exist:', alterError.message);
    }

    // Get active banner ad that hasn't expired
    const [rows] = await connection.execute(`
      SELECT * FROM banner_ads 
      WHERE is_active = 1 
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    const bannerAds = rows as any[];
    
    if (bannerAds.length === 0) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(bannerAds[0]);
    
  } catch (error) {
    console.error('Error fetching active banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner ad' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}