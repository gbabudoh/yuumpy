import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, isMinioConfigured } from '@/lib/storage';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB

export async function POST(request: NextRequest) {
  try {
    if (!isMinioConfigured()) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'video' | 'poster'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const isVideo = type === 'video';
    const allowed = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowed.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const folder = isVideo ? 'hero/videos' : 'hero/posters';
    const filename = `${folder}/hero_${Date.now()}.${ext}`;

    const url = await uploadFile(buffer, filename, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Hero video upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
