import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';


// Basic migration check
let migrationDone = false;
async function ensurePresenceColumns() {
  if (migrationDone) return;
  try {
    // Add columns if they don't exist
    await query("ALTER TABLE sellers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE AFTER last_login");
    await query("ALTER TABLE sellers ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP NULL AFTER is_online");
    migrationDone = true;
  } catch (e) {
    console.warn('Presence columns migration failed:', e.message);
    migrationDone = true;
  }
}

// GET: Check if a seller is online
export async function GET(request: NextRequest) {
  await ensurePresenceColumns();
  const sellerId = request.nextUrl.searchParams.get('seller_id');
  const storeSlug = request.nextUrl.searchParams.get('store_slug');

  if (!sellerId && !storeSlug) {
    return NextResponse.json({ error: 'seller_id or store_slug required' }, { status: 400 });
  }

  try {
    let sql: string;
    let params: (string | number)[];

    if (sellerId) {
      sql = 'SELECT id, is_online, last_seen_at FROM sellers WHERE id = ?';
      params = [Number(sellerId)];
    } else {
      sql = 'SELECT id, is_online, last_seen_at FROM sellers WHERE store_slug = ?';
      params = [storeSlug as string];
    }

    const result = await query(sql, params);
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ online: false, last_seen: null });
    }

    const seller = result[0] as Record<string, unknown>;
    const isOnline = Boolean(seller.is_online);
    const lastSeen = seller.last_seen_at as string | null;

    // Consider seller offline if last_seen is more than 5 minutes ago
    let effectiveOnline = isOnline;
    if (isOnline && lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (lastSeenDate < fiveMinutesAgo) {
        effectiveOnline = false;
      }
    }

    return NextResponse.json({
      online: effectiveOnline,
      last_seen: lastSeen,
    });
  } catch {
    // Columns may not exist yet
    return NextResponse.json({ online: false, last_seen: null });
  }
}

// POST: Update seller online status (called by seller dashboard)
export async function POST(request: NextRequest) {
  await ensurePresenceColumns();
  try {
    const { seller_id, online } = await request.json();
    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id required' }, { status: 400 });
    }

    await query(
      'UPDATE sellers SET is_online = ?, last_seen_at = NOW() WHERE id = ?',
      [online ? 1 : 0, seller_id]
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
  }
}
