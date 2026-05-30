const IMGPROXY_URL = process.env.NEXT_PUBLIC_IMGPROXY_URL || '';
const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || '';

type ResizeType = 'fill' | 'fit' | 'auto';

/**
 * Converts a MinIO URL to an imgproxy URL.
 * imgproxy fetches directly from S3/MinIO via its S3 integration.
 *
 * @param minioUrl  Full MinIO URL (e.g. http://host:9000/bucket/path/file.jpg)
 * @param width     Target width in px (0 = proportional)
 * @param height    Target height in px (0 = proportional)
 * @param resize    Resize type: fill (crop), fit (letterbox), auto
 */
export function imgproxy(
  minioUrl: string,
  width = 0,
  height = 0,
  resize: ResizeType = 'fill'
): string {
  if (!IMGPROXY_URL || !minioUrl) return minioUrl;

  // http://149.102.155.247:9000/yuumpy/path/file.jpg → s3://yuumpy/path/file.jpg
  const s3Url = MINIO_PUBLIC_URL
    ? minioUrl.replace(`${MINIO_PUBLIC_URL}/`, 's3://')
    : minioUrl;

  return `${IMGPROXY_URL}/insecure/rs:${resize}:${width}:${height}:0/plain/${s3Url}`;
}
