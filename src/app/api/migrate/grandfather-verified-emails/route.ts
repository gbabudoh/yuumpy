import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// One-time migration: mark every existing customer as email-verified so the
// new verify-before-login requirement only applies to signups going forward,
// not accounts that already existed before this feature shipped.
export async function POST() {
  try {
    await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) DEFAULT NULL');
    await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token_expiry TIMESTAMP DEFAULT NULL');

    const result = await query(
      'UPDATE customers SET email_verified = TRUE WHERE email_verified IS NOT TRUE'
    );

    return NextResponse.json({ success: true, updated: (result as any)?.rowCount ?? result });
  } catch (error) {
    console.error('Grandfather verified-emails migration error:', error);
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 });
  }
}
