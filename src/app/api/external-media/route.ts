import { NextRequest, NextResponse } from 'next/server';

const MINIO_HOST = `${process.env.MINIO_ENDPOINT || ''}:${process.env.MINIO_PORT || ''}`;

function imgproxyHost(): string {
  try {
    return process.env.NEXT_PUBLIC_IMGPROXY_URL ? new URL(process.env.NEXT_PUBLIC_IMGPROXY_URL).host : '';
  } catch {
    return '';
  }
}

function isAllowed(target: URL): boolean {
  return target.host === MINIO_HOST || target.host === imgproxyHost();
}

// Firefox's HTTPS-Only Mode silently drops any http:// subresource that fails
// to upgrade to https:// (our MinIO/imgproxy servers have no TLS). Fetching
// server-side and streaming back same-origin avoids that upgrade entirely.
export async function GET(request: NextRequest) {
  const u = request.nextUrl.searchParams.get('u');
  if (!u) return new NextResponse('Missing url', { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (!isAllowed(target)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const range = request.headers.get('range');
  const upstream = await fetch(target.toString(), {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('Upstream error', { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const contentLength = upstream.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);
  const contentRange = upstream.headers.get('content-range');
  if (contentRange) headers.set('Content-Range', contentRange);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
