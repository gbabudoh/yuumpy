import { Metadata } from 'next';
import { query } from '@/lib/database';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import CategoriesPageClient, { CategoriesCategory } from './CategoriesPageClient';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

export function generateMetadata(): Metadata {
  return generateSEOMetadata({
    title: 'Browse Categories',
    description: 'Explore every product category on Yuumpy — discover verified sellers across the marketplace.',
    canonical: `${baseUrl}/products/categories`,
    ogTitle: 'Browse Categories — Yuumpy',
    ogDescription: 'Explore every product category on Yuumpy — discover verified sellers across the marketplace.',
  });
}

async function getInitialCategories(): Promise<CategoriesCategory[]> {
  try {
    const sql = `
      SELECT c.*,
             COALESCE(COUNT(DISTINCT p.id)::int, 0) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.is_active = TRUE AND c.parent_id IS NULL
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    const rows = await query(sql);
    return Array.isArray(rows) ? (rows as CategoriesCategory[]) : [];
  } catch (error) {
    console.error('Error fetching initial categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const initialCategories = await getInitialCategories();

  const collectionSchema = generateStructuredData('collectionPage', {
    name: 'Browse Categories',
    description: 'Every product category on the Yuumpy marketplace.',
    url: `${baseUrl}/products/categories`,
    items: initialCategories.map((c) => ({
      name: c.name,
      url: `${baseUrl}/products/${c.slug}`,
      image: c.image_url,
    })),
  });

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <CategoriesPageClient initialCategories={initialCategories} />
    </>
  );
}
