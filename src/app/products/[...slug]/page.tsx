import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { query } from '@/lib/database';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import ProductDetailView from '@/components/ProductDetailView';
import CategoryView from '@/components/CategoryView';
import { Product, ProductSEO, Category, CategorySEO } from '@/types/product';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ? AND p.is_active = 1
    `;
    const result = await query(sql, [slug]);
    if (!Array.isArray(result) || result.length === 0) return null;
    const product = result[0] as Product;
    await attachSellerInfo(product);
    await attachVariations(product);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getSellerProduct(storeSlug: string, productSlug: string): Promise<Product | null> {
  try {
    const sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      INNER JOIN sellers s ON p.seller_id = s.id
      WHERE p.slug = ? AND s.store_slug = ? AND p.is_active = 1
    `;
    const result = await query(sql, [productSlug, storeSlug]);
    if (!Array.isArray(result) || result.length === 0) return null;
    const product = result[0] as Product;
    await attachSellerInfo(product);
    await attachVariations(product);
    return product;
  } catch (error) {
    console.error('Error fetching seller product:', error);
    return null;
  }
}

async function attachSellerInfo(product: Product) {
  try {
    const sellerResult = await query(
      `SELECT s.id as seller_id, s.store_name as seller_store_name, s.store_slug as seller_store_slug,
              s.logo_url as seller_logo_url, s.city as seller_city, s.state_province as seller_state_province,
              s.country as seller_country, s.total_orders as seller_total_orders,
              s.average_rating as seller_average_rating, s.total_reviews as seller_total_reviews,
              s.is_verified as seller_is_verified
       FROM sellers s INNER JOIN products p ON p.seller_id = s.id WHERE p.id = ?`,
      [product.id]
    );
    if (Array.isArray(sellerResult) && sellerResult.length > 0) {
      const s = sellerResult[0] as Record<string, unknown>;
      product.seller_id = s.seller_id as number;
      product.seller_store_name = s.seller_store_name as string;
      product.seller_store_slug = s.seller_store_slug as string;
      product.seller_logo_url = s.seller_logo_url as string;
      product.seller_city = s.seller_city as string;
      product.seller_state_province = s.seller_state_province as string;
      product.seller_country = s.seller_country as string;
      product.seller_total_orders = s.seller_total_orders as number;
      product.seller_average_rating = s.seller_average_rating as number;
      product.seller_total_reviews = s.seller_total_reviews as number;
      product.seller_is_verified = Boolean(s.seller_is_verified);
      try {
        const settings = await query('SELECT processing_time FROM seller_settings WHERE seller_id = ?', [product.seller_id]);
        if (Array.isArray(settings) && settings.length > 0) {
          product.seller_processing_time = (settings[0] as Record<string, unknown>).processing_time as string;
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}

async function attachVariations(product: Product) {
  try {
    const rows = await query('SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    if (Array.isArray(rows) && rows.length > 0) {
      product.variations = rows.map((v: Record<string, unknown>) => ({
        id: v.id as number, product_id: v.product_id as number,
        colour_name: v.colour_name as string, colour_hex: (v.colour_hex as string) || null,
        main_image_url: (v.main_image_url as string) || null,
        gallery_images: v.gallery_images ? (typeof v.gallery_images === 'string' ? JSON.parse(v.gallery_images) : v.gallery_images as string[]) : [],
        sort_order: (v.sort_order as number) || 0,
      }));
    }
  } catch { /* table may not exist */ }

  if (!product.variations || product.variations.length === 0) {
    try {
      const raw = (product as Record<string, unknown>).colour_variants;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) {
          product.variations = parsed.map((v: Record<string, unknown>, idx: number) => ({
            id: idx + 1, product_id: product.id,
            colour_name: (v.colour as string) || (v.label as string) || 'Default',
            colour_hex: (v.hex as string) || null,
            main_image_url: (v.imageUrl as string) || null,
            gallery_images: [], sort_order: idx,
          }));
        }
      }
    } catch { /* ignore */ }
  }
}

async function getCategory(slug: string) {
  try {
    const result = await query('SELECT * FROM categories WHERE slug = ? AND is_active = 1', [slug]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch { return null; }
}

async function getProductSEO(productId: number): Promise<ProductSEO | null> {
  const result = await query('SELECT * FROM product_seo WHERE product_id = ?', [productId]);
  return Array.isArray(result) && result.length > 0 ? (result[0] as ProductSEO) : null;
}

async function getCategorySEO(categoryId: number) {
  const result = await query('SELECT * FROM category_seo WHERE category_id = ?', [categoryId]);
  return Array.isArray(result) && result.length > 0 ? result[0] : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Two segments: /products/[storeSlug]/[productSlug]
  if (slug.length === 2) {
    const [storeSlug, productSlug] = slug;
    const product = await getSellerProduct(storeSlug, productSlug);
    if (!product) return { title: 'Product Not Found' };
    const seo = await getProductSEO(product.id);
    return generateSEOMetadata({
      title: seo?.meta_title || product.meta_title || product.name,
      description: seo?.meta_description || product.meta_description || product.short_description || product.description || '',
      keywords: seo?.meta_keywords || product.meta_keywords || '',
      ogTitle: seo?.og_title || product.og_title || product.name,
      ogDescription: seo?.og_description || product.og_description || product.short_description || product.description || '',
      ogImage: seo?.og_image || product.og_image || product.image_url || '',
      twitterTitle: seo?.twitter_title || product.twitter_title || product.name,
      twitterDescription: seo?.twitter_description || product.twitter_description || product.short_description || product.description || '',
      twitterImage: seo?.twitter_image || product.twitter_image || product.image_url || '',
      noIndex: Boolean(seo?.no_index || product.no_index),
      noFollow: Boolean(seo?.no_follow || product.no_follow),
    });
  }

  // Single segment: /products/[slug] — could be product or category
  if (slug.length === 1) {
    const productSlug = slug[0];
    const product = await getProduct(productSlug);
    if (product) {
      const seo = await getProductSEO(product.id);
      return generateSEOMetadata({
        title: seo?.meta_title || product.meta_title || product.name,
        description: seo?.meta_description || product.meta_description || product.short_description || product.description || '',
        keywords: seo?.meta_keywords || product.meta_keywords || '',
        ogTitle: seo?.og_title || product.og_title || product.name,
        ogDescription: seo?.og_description || product.og_description || product.short_description || product.description || '',
        ogImage: seo?.og_image || product.og_image || product.image_url || '',
        twitterTitle: seo?.twitter_title || product.twitter_title || product.name,
        twitterDescription: seo?.twitter_description || product.twitter_description || product.short_description || product.description || '',
        twitterImage: seo?.twitter_image || product.twitter_image || product.image_url || '',
        noIndex: Boolean(seo?.no_index || product.no_index),
        noFollow: Boolean(seo?.no_follow || product.no_follow),
      });
    }

    const category = await getCategory(productSlug);
    if (category) {
      const cat = category as Category;
      const seo = await getCategorySEO(cat.id) as CategorySEO | null;
      return generateSEOMetadata({
        title: seo?.meta_title || cat.name,
        description: seo?.meta_description || cat.description || '',
        keywords: seo?.meta_keywords || '',
        ogTitle: seo?.og_title || cat.name,
        ogDescription: seo?.og_description || cat.description || '',
        ogImage: seo?.og_image || cat.image_url || '',
        noIndex: Boolean(seo?.no_index),
        noFollow: Boolean(seo?.no_follow),
      });
    }
  }

  return { title: 'Not Found' };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // Two segments: /products/[storeSlug]/[productSlug]
  if (slug.length === 2) {
    const [storeSlug, productSlug] = slug;
    const product = await getSellerProduct(storeSlug, productSlug);
    if (!product) notFound();
    return <ProductDetailView product={product} />;
  }

  // Single segment: /products/[slug]
  if (slug.length === 1) {
    const productSlug = slug[0];

    // Try as product first
    const product = await getProduct(productSlug);
    if (product) {
      // If it's a seller product, redirect to the friendly URL
      if (product.seller_store_slug) {
        redirect(`/products/${product.seller_store_slug}/${product.slug}`);
      }
      return <ProductDetailView product={product} />;
    }

    // Try as category
    const category = await getCategory(productSlug);
    if (category) {
      return <CategoryView initialSlug={productSlug} />;
    }
  }

  notFound();
}
