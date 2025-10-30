import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerAd = await query('SELECT * FROM banner_ads WHERE id = ?', [id]);

    if (!bannerAd || (bannerAd as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Banner ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json((bannerAd as any[])[0]);
  } catch (error) {
    console.error('Error fetching banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner ad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔍 Updating banner ad:', { id, body });
    
    const {
      title,
      description,
      image_url,
      link_url,
      position,
      is_active,
      start_date,
      end_date,
      expires_at,
      duration,
      is_repeating
    } = body;

    // Validate required fields
    if (!title || !description || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, or image_url' },
        { status: 400 }
      );
    }

    // Simplified update query - only update the basic fields that definitely exist
    const sql = `
      UPDATE banner_ads SET
        title = ?, description = ?, image_url = ?, link_url = ?,
        position = ?, is_active = ?, start_date = ?, end_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const updateParams = [
      title, 
      description, 
      image_url, 
      link_url || null, 
      position || 'top', 
      is_active !== undefined ? is_active : true, 
      start_date || null, 
      end_date || null,
      id
    ];

    console.log('🔍 Update SQL params:', updateParams);

    const result = await query(sql, updateParams);
    console.log('🔍 Update result:', result);

    // Return the updated banner ad
    const updatedBannerAd = await query('SELECT * FROM banner_ads WHERE id = ?', [id]);
    console.log('🔍 Updated banner ad:', updatedBannerAd);

    if (!updatedBannerAd || (updatedBannerAd as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Banner ad not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json((updatedBannerAd as any[])[0]);
  } catch (error) {
    console.error('❌ Error updating banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to update banner ad', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await query('DELETE FROM banner_ads WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner ad' },
      { status: 500 }
    );
  }
}