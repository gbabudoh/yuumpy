import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { query } from '@/lib/database';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import ProductDetailView from '@/components/ProductDetailView';
import CategoryView from '@/components/CategoryView';
import { Product, ProductSEO, Category, CategorySEO } from '@/types/product';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
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

    // Fetch colour variations
    try {
      const variationRows = await query(
        'SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
        [product.id]
      );
      if (Array.isArray(variationRows) && variationRows.length > 0) {
        product.variations = variationRows.map((v: Record<string, unknown>) => ({
          id: v.id as number,
          product_id: v.product_id as number,
          colour_name: v.colour_name as string,
          colour_hex: (v.colour_hex as string) || null,
          main_image_url: (v.main_image_url as string) || null,
          gallery_images: v.gallery_images
            ? (typeof v.gallery_images === 'string' ? JSON.parse(v.gallery_images) : v.gallery_images as string[])
            : [],
          sort_order: (v.sort_order as number) || 0,
        }));
      }
    } catch {
      // Table may not exist yet
    }

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getCategory(slug: string) {
  try {
    const sql = 'SELECT * FROM categories WHERE slug = ? AND is_active = 1';
    const result = await query(sql, [slug]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getProductSEO(productId: number): Promise<ProductSEO | null> {
  const sql = 'SELECT * FROM product_seo WHERE product_id = ?';
  const result = await query(sql, [productId]);
  return Array.isArray(result) && result.length > 0 ? (result[0] as ProductSEO) : null;
}

async function getCategorySEO(categoryId: number) {
  const sql = 'SELECT * FROM category_seo WHERE category_id = ?';
  const result = await query(sql, [categoryId]);
  return Array.isArray(result) && result.length > 0 ? result[0] : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Try product first
  const product = await getProduct(slug);
  if (product) {
    const seoData = await getProductSEO(product.id);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
    
    return generateSEOMetadata({
      title: (seoData?.meta_title as string) || product.name,
      description: (seoData?.meta_description as string) || product.short_description || product.description,
      keywords: (seoData?.meta_keywords as string) || `${product.name}, ${product.category_name}, ${product.brand_name || ''}`.trim(),
      canonical: `${baseUrl}/products/${product.slug}`,
      ogTitle: (seoData?.og_title as string) || product.name,
      ogDescription: (seoData?.og_description as string) || product.short_description || product.description,
      ogImage: (seoData?.og_image as string) || product.image_url,
      twitterTitle: (seoData?.twitter_title as string) || product.name,
      twitterDescription: (seoData?.twitter_description as string) || product.short_description || product.description,
      twitterImage: (seoData?.twitter_image as string) || product.image_url,
      noIndex: Boolean(seoData?.no_index),
      noFollow: Boolean(seoData?.no_follow)
    });
  }

  // Try category
  const category = await getCategory(slug) as Category | null;
  if (category) {
    const seoData = await getCategorySEO(category.id) as CategorySEO | null;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
    
    return generateSEOMetadata({
      title: seoData?.meta_title || category.name,
      description: seoData?.meta_description || category.description,
      keywords: seoData?.meta_keywords || category.name,
      canonical: `${baseUrl}/products/${category.slug}`,
      ogTitle: seoData?.og_title || category.name,
      ogDescription: seoData?.og_description || category.description,
      ogImage: seoData?.og_image || category.image_url,
      twitterTitle: seoData?.twitter_title || category.name,
      twitterDescription: seoData?.twitter_description || category.description,
      twitterImage: seoData?.twitter_image || category.image_url,
      noIndex: Boolean(seoData?.no_index),
      noFollow: Boolean(seoData?.no_follow)
    });
  }

  return {
    title: 'Not Found | Yuumpy',
    description: 'The page you are looking for could not be found.'
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // Try fetching as product first
  const product = await getProduct(slug);
  if (product) {
    return <ProductDetailView product={product} />;
  }

  // If not a product, try fetching as category
  const category = await getCategory(slug);
  if (category) {
    return <CategoryView initialSlug={slug} />;
  }

  // Neither found
  notFound();
}