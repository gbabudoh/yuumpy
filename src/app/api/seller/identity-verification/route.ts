import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { query } from '@/lib/database';
import { getAuthenticatedSeller } from '@/lib/seller-session';

const BUCKET = process.env.MINIO_BUCKET || 'yuumpy';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS identity_verifications (
      id SERIAL PRIMARY KEY,
      seller_id INT NOT NULL,
      document_type VARCHAR(20) NOT NULL,
      object_key VARCHAR(500) NOT NULL,
      status VARCHAR(10) DEFAULT 'pending',
      admin_notes TEXT,
      reviewed_by INT,
      reviewed_at TIMESTAMP,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function watermarkImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const { width = 800, height = 600 } = await image.metadata();

  const svgWatermark = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="wm" width="420" height="110" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <text x="10" y="55" font-family="Arial, Helvetica, sans-serif" font-weight="bold"
            font-size="22" fill="rgba(109,40,217,0.55)" letter-spacing="4">YUUMPY VERIFICATION ONLY</text>
          <text x="10" y="82" font-family="Arial, Helvetica, sans-serif"
            font-size="13" fill="rgba(109,40,217,0.38)" letter-spacing="2">NOT FOR REUSE · YUUMPY.COM</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)"/>
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svgWatermark), blend: 'over' }])
    .jpeg({ quality: 88 })
    .toBuffer();
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable();
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const rows = await query(
      `SELECT id, document_type, status, admin_notes, submitted_at, reviewed_at
       FROM identity_verifications WHERE seller_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
      [seller.id]
    ) as any[];

    return NextResponse.json(rows[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Check for existing pending/approved verification
    const existing = await query(
      `SELECT id, status FROM identity_verifications WHERE seller_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
      [seller.id]
    ) as any[];

    if (existing.length > 0 && existing[0].status === 'approved') {
      return NextResponse.json({ error: 'Your identity is already verified.' }, { status: 400 });
    }
    if (existing.length > 0 && existing[0].status === 'pending') {
      return NextResponse.json({ error: 'You have a verification already under review.' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('document_type') as string | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!['passport', 'national_id', 'drivers_licence'].includes(documentType || '')) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, or WebP images are accepted' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const watermarked = await watermarkImage(rawBuffer);

    // Store in private MinIO folder (not publicly listed)
    const objectKey = `identity-docs/${seller.id}/${Date.now()}_${documentType}.jpg`;

    const Minio = await import('minio');
    const minioClient = new Minio.Client({
      endPoint: MINIO_ENDPOINT,
      port: parseInt(MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    });

    await minioClient.putObject(BUCKET, objectKey, watermarked, watermarked.length, {
      'Content-Type': 'image/jpeg',
    });

    // Save record — store only the object key, never the public URL
    const result = await query(
      `INSERT INTO identity_verifications (seller_id, document_type, object_key, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [seller.id, documentType, objectKey]
    ) as any[];

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    console.error('Identity verification upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
