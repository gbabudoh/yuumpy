import { Metadata } from 'next';
import { query } from '@/lib/database';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { Product } from '@/types/product';
import ProductsPageClient, { ProductsCategory, ProductsBrand } from './ProductsPageClient';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

export function generateMetadata(): Metadata {
  return generateSEOMetadata({
    title: 'All Products',
    description: 'Browse products from verified sellers across the Yuumpy marketplace, all backed by the Yuumpy Guarantee.',
    canonical: `${baseUrl}/products`,
    ogTitle: 'All Products — Yuumpy',
    ogDescription: 'Browse products from verified sellers across the Yuumpy marketplace, all backed by the Yuumpy Guarantee.',
  });
}

async function getInitialProducts(): Promise<Product[]> {
  try {
    const sql = `
      SELECT p.id, p.name, p.slug, p.description, p.short_description, p.long_description, p.product_review,
             p.price, p.original_price,
             p.affiliate_url, p.affiliate_partner_name, p.external_purchase_info,
             p.purchase_type, p.product_condition, p.stock_quantity,
             p.image_url, p.gallery,
             p.category_id, p.subcategory_id, p.brand_id, p.is_featured, p.is_bestseller, p.is_active,
             p.meta_title, p.meta_description, p.created_at,
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug,
             sel.store_slug as seller_store_slug,
             sel.store_name as seller_store_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN sellers sel ON p.seller_id = sel.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT 24
    `;
    const rows = await query(sql);
    return Array.isArray(rows) ? (rows as Product[]) : [];
  } catch (error) {
    console.error('Error fetching initial products:', error);
    return [];
  }
}

async function getInitialCategories(): Promise<ProductsCategory[]> {
  try {
    const sql = `
      SELECT c.id, c.name, c.slug,
             COALESCE(COUNT(p.id)::int, 0) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.is_active = TRUE AND c.parent_id IS NULL
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    const rows = await query(sql);
    return Array.isArray(rows) ? (rows as ProductsCategory[]) : [];
  } catch (error) {
    console.error('Error fetching initial categories:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const [initialProducts, initialCategories] = await Promise.all([
    getInitialProducts(),
    getInitialCategories(),
  ]);
  const initialBrands: ProductsBrand[] = [];

  const collectionSchema = generateStructuredData('collectionPage', {
    name: 'All Products',
    description: 'Products from verified sellers across the Yuumpy marketplace.',
    url: `${baseUrl}/products`,
    items: initialProducts.slice(0, 20).map((p) => ({
      name: p.name,
      url: `${baseUrl}/products/${p.slug}`,
      image: p.image_url,
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
      <ProductsPageClient
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialBrands={initialBrands}
      />
    </>
  );
}
