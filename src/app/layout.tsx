import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import { CartProvider } from "@/hooks/useCart";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'),
  ...generateSEOMetadata({
    title: "Yuumpy — The Marketplace You Can Trust",
    description: "Buy from verified sellers with escrow protection. Every purchase is backed by the Yuumpy Guarantee. Shop confidently, sell successfully.",
    keywords: "marketplace, escrow, trusted sellers, verified products, online shopping, sell online, Yuumpy Guarantee",
    ogTitle: "Yuumpy — The Marketplace You Can Trust",
    ogDescription: "Buy from verified sellers with escrow protection. Every purchase is backed by the Yuumpy Guarantee.",
    ogImage: "/logo.png" }),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ] },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml' } };

export default function RootLayout({
  children }: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateStructuredData('organization');

  return (
    <html lang="en">
      <head>
        {organizationSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema) }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Analytics />
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
