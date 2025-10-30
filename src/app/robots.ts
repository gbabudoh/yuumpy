import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/test-upload/',
          '/_next/',
          '/private/',
        ] },
      {
        userAgent: 'GPTBot',
        disallow: '/' },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/' },
      {
        userAgent: 'CCBot',
        disallow: '/' },
      {
        userAgent: 'anthropic-ai',
        disallow: '/' },
      {
        userAgent: 'Claude-Web',
        disallow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl };
}
