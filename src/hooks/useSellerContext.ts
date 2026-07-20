'use client';

import { createContext, useContext } from 'react';

export interface Seller {
  id: number;
  store_name: string;
  store_slug: string;
  email: string;
  status: string;
  logo_url: string;
  banner_url: string;
  description: string;
  total_sales: number;
  total_orders: number;
  average_rating: number;
  commission_rate: number;
  phone: string;
  website: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  artisan_story?: string;
  studio_images?: string;
  specialties?: string;
  social_links?: string;
  profile_video_url?: string;
}

export const SellerContext = createContext<{ seller: Seller | null; loading: boolean }>({
  seller: null,
  loading: true,
});

export function useSellerContext() {
  return useContext(SellerContext);
}
