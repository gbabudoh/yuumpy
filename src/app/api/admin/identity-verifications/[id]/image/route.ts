import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, verifyAdminSession } from '@/lib/admin-auth';
import { getFileBuffer } from '@/lib/storage';

async function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value;
  if (!token) return null;
  if (!verifyToken(token)) return null;
  return verifyAdminSession(token);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    const rows = await query(
      `SELECT object_key FROM identity_verifications WHERE id = $1`,
      [id]
    ) as any[];

    if (!rows.length || !rows[0].object_key) {
      return new NextResponse('Not found', { status: 404 });
    }

    const imageBuffer = await getFileBuffer(rows[0].object_key);

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error: any) {
    console.error('Identity image fetch error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}
