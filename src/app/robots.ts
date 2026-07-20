import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

  return {
    rules: [
      {
        // AI crawlers (GPTBot, ChatGPT-User, ClaudeBot, Google-Extended,
        // PerplexityBot, CCBot, etc.) are intentionally allowed here — Yuumpy
        // wants to be discoverable and citable by AI answer engines, so no
        // per-bot disallow rules are listed for them; they fall under this
        // general allow.
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/test-upload/',
          '/test-email/',
          '/fix-images/',
          '/_next/',
          '/private/',
          '/account/',
          '/cart/',
          '/checkout/',
        ] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl };
}
