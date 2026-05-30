import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, verifyAdminSession } from '@/lib/admin-auth';

async function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value;
  if (!token) return null;
  if (!verifyToken(token)) return null;
  return verifyAdminSession(token);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause = status ? `WHERE iv.status = $1` : '';
    const params = status ? [status] : [];

    const rows = await query(
      `SELECT iv.id, iv.seller_id, iv.document_type, iv.status, iv.admin_notes,
              iv.submitted_at, iv.reviewed_at,
              s.store_name, s.email, s.first_name, s.last_name
       FROM identity_verifications iv
       LEFT JOIN sellers s ON s.id = iv.seller_id
       ${whereClause}
       ORDER BY iv.submitted_at DESC`,
      params
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
