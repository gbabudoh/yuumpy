import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yuumpy',
  port: parseInt(process.env.DB_PORT || '3306') };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM product_banner_ads WHERE id = ?', 
      [id]
    );

    const bannerAds = rows as any[];
    if (bannerAds.length === 0) {
      return NextResponse.json(
        { error: 'Product banner ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bannerAds[0]);
  } catch (error) {
    console.error('Error fetching product banner ad:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
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
      UPDATE product_banner_ads SET
        title = ?, description = ?, image_url = ?, link_url = ?,
        is_active = ?, start_date = ?, end_date = ?, expires_at = ?,
        duration = ?, is_repeating = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, description, image_url, link_url || null, 
      is_active !== undefined ? is_active : true, 
      start_date || null, end_date || null, expires_at || null,
      duration || null, is_repeating || false, id
    ]);

    // Return the updated banner ad
    const [updatedRows] = await connection.execute(
      'SELECT * FROM product_banner_ads WHERE id = ?', 
      [id]
    );
    
    const updatedBannerAds = updatedRows as any[];
    if (updatedBannerAds.length === 0) {
      return NextResponse.json(
        { error: 'Product banner ad not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBannerAds[0]);
  } catch (error) {
    console.error('Error updating product banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to update product banner ad' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM product_banner_ads WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete product banner ad' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}