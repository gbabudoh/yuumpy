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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
  
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

export function generateStructuredData(type: 'product' | 'organization' | 'breadcrumb', data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

  switch (type) {
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.image_url,
        brand: {
          '@type': 'Brand',
          name: data.brand_name },
        category: data.category_name,
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'GBP',
          availability: data.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `${baseUrl}/products/${data.slug}` },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          reviewCount: data.review_count || 1 } : undefined };

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

    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url })) };

    default:
      return null;
  }
}
