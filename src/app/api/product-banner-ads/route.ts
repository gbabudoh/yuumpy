import { NextRequest, NextResponse } from 'next/server';
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
    
    // Create product_banner_ads table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_banner_ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        start_date DATE,
        end_date DATE,
        expires_at DATETIME,
        duration VARCHAR(20),
        is_repeating BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Get all product banner ads
    const [rows] = await connection.execute(`
      SELECT * FROM product_banner_ads 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('Error fetching product banner ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product banner ads' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    const body = await request.json();
    
    const {
      title,
      description,
      image_url,
      link_url,
      is_active,
      start_date,
      end_date,
      expires_at,
      duration,
      is_repeating
    } = body;

    const [result] = await connection.execute(`
      INSERT INTO product_banner_ads (
        title, description, image_url, link_url, is_active, 
        start_date, end_date, expires_at, duration, is_repeating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, image_url, link_url, is_active, 
      start_date, end_date, expires_at, duration, is_repeating
    ]);

    const newBannerAd = {
      id: (result as any).insertId,
      title,
      description,
      image_url,
      link_url,
      is_active,
      start_date,
      end_date,
      expires_at,
      duration,
      is_repeating,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newBannerAd);
    
  } catch (error) {
    console.error('Error creating product banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to create product banner ad' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}