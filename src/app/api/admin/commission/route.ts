import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Get commission configs
    let configs: unknown[] = [];
    try {
      configs = await query('SELECT * FROM commission_config ORDER BY type, created_at DESC') as unknown[];
    } catch { configs = []; }

    // Get seller-specific rates
    let sellers: unknown[] = [];
    try {
      sellers = await query(
        'SELECT id, store_name, store_slug, commission_rate, status, is_verified, total_sales, total_orders FROM sellers ORDER BY store_name'
      ) as unknown[];
    } catch { sellers = []; }

    return NextResponse.json({ configs, sellers });
  } catch (error) {
    console.error('Commission API error:', error);
    return NextResponse.json({ error: 'Failed to load commission data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_global') {
      const { rate } = body;
      if (!rate || rate < 0 || rate > 100) {
        return NextResponse.json({ error: 'Invalid rate (0-100)' }, { status: 400 });
      }
      await query(
        "UPDATE commission_config SET rate = ?, updated_at = NOW() WHERE type = 'global'",
        [rate]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'update_seller') {
      const { seller_id, rate } = body;
      if (!seller_id || rate === undefined || rate < 0 || rate > 100) {
        return NextResponse.json({ error: 'Invalid seller_id or rate' }, { status: 400 });
      }
      await query('UPDATE sellers SET commission_rate = ? WHERE id = ?', [rate, seller_id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_category') {
      const { name, target_id, rate } = body;
      if (!rate || rate < 0 || rate > 100) {
        return NextResponse.json({ error: 'Invalid rate' }, { status: 400 });
      }
      await query(
        'INSERT INTO commission_config (name, type, target_id, rate, is_active) VALUES (?, ?, ?, ?, 1)',
        [name || 'Category Commission', 'category', target_id || null, rate]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_config') {
      const { config_id, is_active } = body;
      await query('UPDATE commission_config SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, config_id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_config') {
      const { config_id } = body;
      await query("DELETE FROM commission_config WHERE id = ? AND type != 'global'", [config_id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Commission update error:', error);
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}
