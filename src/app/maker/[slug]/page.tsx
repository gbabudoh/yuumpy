import { notFound } from 'next/navigation';
import { MakerProfile } from '@/components/MakerProfile';

async function getArtisanData(slug: string) {
  // Use absolute URL for server-side fetch or use a direct library call
  // For simplicity in this environment, we'll use a direct fetch if available or a mock for safety
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/sellers/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Fetch artisan error:', error);
    return null;
  }
}

export default async function ArtisanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArtisanData(slug);

  if (!data) {
    notFound();
  }

  return <MakerProfile seller={data.seller} products={data.products} />;
}
