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
    
    // Get active product banner ad that hasn't expired
    const [rows] = await connection.execute(`
      SELECT * FROM product_banner_ads 
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
    console.error('Error fetching active product banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product banner ad' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}