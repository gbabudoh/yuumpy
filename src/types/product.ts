export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  long_description?: string;
  product_review?: string;
  price: number;
  original_price?: number;
  affiliate_url: string;
  affiliate_partner_name?: string;
  external_purchase_info?: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
  stock_quantity?: number;
  image_url: string;
  gallery?: string | string[];
  category_name: string;
  category_slug: string;
  brand_name?: string;
  brand_slug?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index?: boolean;
  no_follow?: boolean;
  banner_ad_title?: string;
  banner_ad_description?: string;
  banner_ad_image_url?: string;
  banner_ad_link_url?: string;
  banner_ad_duration?: number;
  banner_ad_is_repeating?: boolean;
  banner_ad_start_date?: string;
  banner_ad_end_date?: string;
  banner_ad_is_active?: boolean;
}

export interface ProductSEO {
  product_id: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index?: boolean | number;
  no_follow?: boolean | number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_count: number;
  is_active: boolean;
  updated_at: string;
}

export interface CategorySEO {
  category_id: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index?: boolean | number;
  no_follow?: boolean | number;
}
