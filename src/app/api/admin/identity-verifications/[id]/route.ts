import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, verifyAdminSession } from '@/lib/admin-auth';

async function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value;
  if (!token) return null;
  if (!verifyToken(token)) return null;
  return verifyAdminSession(token);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status, admin_notes } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await query(
      `UPDATE identity_verifications
       SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [status, admin_notes || null, admin.id, id]
    );

    // If approved, mark seller as verified
    if (status === 'approved') {
      const rows = await query(
        `SELECT seller_id FROM identity_verifications WHERE id = $1`,
        [id]
      ) as any[];
      if (rows.length > 0) {
        await query(`UPDATE sellers SET is_verified = TRUE WHERE id = $1`, [rows[0].seller_id]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
