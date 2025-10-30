import { MetadataRoute } from 'next';
import { query } from '@/lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1 },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9 },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8 },
    {
      url: `${baseUrl}/featured`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8 },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6 },
    {
      url: `${baseUrl}/advert`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5 },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3 },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3 },
  ];

  try {
    // Dynamic product pages
    const productsSql = `
      SELECT slug, updated_at 
      FROM products 
      WHERE is_active = 1 
      ORDER BY updated_at DESC
    `;
    const products = await query(productsSql);

    const productPages = Array.isArray(products) ? products.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7 })) : [];

    // Dynamic category pages
    const categoriesSql = `
      SELECT slug, updated_at 
      FROM categories 
      WHERE is_active = 1 
      ORDER BY updated_at DESC
    `;
    const categories = await query(categoriesSql);

    const categoryPages = Array.isArray(categories) ? categories.map((category: any) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6 })) : [];

    // Custom pages
    const pagesSql = `
      SELECT slug, updated_at 
      FROM pages 
      WHERE is_active = 1 
      ORDER BY updated_at DESC
    `;
    const pages = await query(pagesSql);

    const customPages = Array.isArray(pages) ? pages.map((page: any) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5 })) : [];

    return [...staticPages, ...productPages, ...categoryPages, ...customPages];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database query fails
    return staticPages;
  }
}
