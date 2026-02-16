import { Metadata } from 'next';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export function generateMetadata(seoData: SEOData, defaultTitle?: string): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard = 'summary_large_image',
    twitterTitle,
    twitterDescription,
    twitterImage,
    noIndex = false,
    noFollow = false
  } = seoData;

  const siteName = 'Yuumpy';
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle || siteName;
  const finalDescription = description || 'Discover amazing products from our curated collection';
  const finalOgImage = ogImage || '/logo.png';

  const robots = [];
  if (noIndex) robots.push('noindex');
  if (noFollow) robots.push('nofollow');
  if (!noIndex && !noFollow) robots.push('index', 'follow');

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: keywords,
    robots: robots.join(', '),
    alternates: {
      canonical: canonical || undefined },
    openGraph: {
      title: ogTitle || finalTitle,
      description: ogDescription || finalDescription,
      url: canonical,
      siteName: siteName,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: ogTitle || finalTitle },
      ],
      locale: 'en_US',
      type: 'website' },
    twitter: {
      card: twitterCard as 'summary' | 'summary_large_image' | 'app',
      title: twitterTitle || finalTitle,
      description: twitterDescription || finalDescription,
      images: [twitterImage || finalOgImage] },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION } };
}

interface StructuredProductData {
  name: string;
  description: string;
  image_url: string;
  brand_name?: string;
  category_name?: string;
  price: number;
  is_active: boolean;
  slug: string;
  rating?: number;
  review_count?: number;
}

interface StructuredBreadcrumbData {
  items: { name: string; url: string }[];
}

export function generateStructuredData(type: 'product' | 'organization' | 'breadcrumb', data?: StructuredProductData | StructuredBreadcrumbData) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

  switch (type) {
    case 'product': {
      const p = data as StructuredProductData;
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: p.description,
        image: p.image_url,
        brand: {
          '@type': 'Brand',
          name: p.brand_name },
        category: p.category_name,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'GBP',
          availability: p.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `${baseUrl}/products/${p.slug}` },
        aggregateRating: p.rating ? {
          '@type': 'AggregateRating',
          ratingValue: p.rating,
          reviewCount: p.review_count || 1 } : undefined };
    }

    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Yuumpy',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Discover amazing products from our curated collection',
        sameAs: [
          process.env.FACEBOOK_URL,
          process.env.TWITTER_URL,
          process.env.INSTAGRAM_URL,
        ].filter(Boolean) };

    case 'breadcrumb': {
      const b = data as StructuredBreadcrumbData;
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: b.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url })) };
    }

    default:
      return null;
  }
}
