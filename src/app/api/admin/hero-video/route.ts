import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

const KEYS = ['hero_video_url', 'hero_video_poster', 'hero_episode_number', 'hero_episode_title', 'hero_episode_quote'];

export async function GET() {
  try {
    const rows = await query(
      `SELECT key_name, value FROM settings WHERE key_name = ANY($1::text[])`,
      [KEYS]
    ) as { key_name: string; value: string }[];

    const settings: Record<string, string> = {};
    for (const key of KEYS) settings[key] = '';
    for (const row of rows) settings[row.key_name] = row.value ?? '';

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    for (const key of KEYS) {
      if (key in body) {
        await query(
          `INSERT INTO settings (key_name, value) VALUES (?, ?)
           ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [key, body[key] ?? '']
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
