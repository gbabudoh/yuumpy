# Yuumpy Platform Description

## Overview

**Yuumpy** is a modern e-commerce affiliate marketplace platform that connects customers with products from trusted retailers. The platform operates as a hybrid model, supporting both affiliate product listings (redirecting to partner retailers) and direct sales with integrated checkout.

---

## Platform Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | MySQL with connection pooling |
| **Payments** | Stripe (for direct sales & banner ads) |
| **Images** | Cloudinary CDN |
| **Analytics** | Google Analytics + Matomo |
| **Icons** | Heroicons, Lucide React |

### Project Structure

```
yuumpy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # REST API endpoints
│   │   ├── admin/             # Admin dashboard
│   │   ├── products/          # Product listing & details
│   │   ├── categories/        # Category browsing
│   │   ├── checkout/          # Direct purchase checkout
│   │   └── account/           # Customer account management
│   ├── components/            # Reusable React components
│   └── lib/                   # Utilities & database connection
├── public/                    # Static assets
├── migrations/                # Database migrations
└── scripts/                   # Utility scripts
```

---

## How the Platform Serves Customers

### 1. Product Discovery

Customers can discover products through multiple pathways:

- **Homepage**: Featured products, bestsellers, and promotional banners
- **Category Browsing**: Organized product categories and subcategories
- **Search**: Full-text search across product names, descriptions, brands, and conditions
- **Filters**: Filter by category, brand, price range, and product condition (New/Refurbished/Used)
- **Sorting**: Sort by price, newest, or relevance

### 2. Product Information

Each product page provides:

- **High-quality images** with gallery support
- **Detailed descriptions** and specifications
- **Product condition badges** (New, Refurbished, Used)
- **Pricing** with original price comparison when applicable
- **Brand information** and category context
- **Product reviews** when available

### 3. Purchase Options

The platform supports two purchase models:

#### Affiliate Products
- Products sourced from partner retailers (e.g., Amazon UK)
- "Buy Now" redirects customer to the retailer's website
- Clear disclosure: "You will be redirected to [Partner] to complete your purchase"
- Commission earned on successful purchases

#### Direct Sales
- Products sold directly through Yuumpy
- Integrated Stripe checkout
- Order management and tracking
- Customer account for order history

### 4. Product Condition Transparency

Products are clearly labeled with their condition:

| Condition | Description |
|-----------|-------------|
| **New** | Brand new, unopened products |
| **Refurbished** | Professionally restored to working condition |
| **Used** | Pre-owned products in good condition |

Customers can filter and search by condition to find exactly what they need.

---

## Customer Benefits

### 🛒 **Curated Selection**
Hand-picked products from trusted brands and retailers, saving customers time searching across multiple websites.

### 💰 **Price Transparency**
Clear pricing with original price comparisons, helping customers identify genuine deals.

### 🔍 **Advanced Search & Filtering**
Powerful search that understands product conditions, categories, and brands. Filter by multiple criteria to find the perfect product.

### 📱 **Mobile-Optimized Experience**
Fully responsive design that works seamlessly on phones, tablets, and desktops.

### 🏷️ **Condition Clarity**
Clear product condition labeling (New/Refurbished/Used) so customers know exactly what they're buying.

### 🔒 **Secure Transactions**
- Affiliate purchases through trusted retailers
- Direct purchases secured by Stripe payment processing
- No sensitive payment data stored on platform

### 📦 **Order Tracking**
For direct purchases, customers can track their orders through their account dashboard.

---

## Platform Features

### For Customers

| Feature | Description |
|---------|-------------|
| Product Search | Full-text search with condition filtering |
| Category Navigation | Browse by category and subcategory |
| Brand Filtering | Filter products by brand |
| Price Filtering | Set min/max price ranges |
| Condition Filtering | Filter by New, Refurbished, or Used |
| Wishlist | Save products for later (coming soon) |
| Account Dashboard | View orders and manage profile |
| Responsive Design | Works on all devices |

### For Administrators

| Feature | Description |
|---------|-------------|
| Product Management | Full CRUD for products with image upload |
| Category Management | Organize products into categories/subcategories |
| Brand Management | Manage product brands |
| Order Management | Process and track direct sale orders |
| Banner Ads | Manage promotional banner advertisements |
| Analytics Dashboard | Track views, clicks, and conversions |
| SEO Management | Control meta titles and descriptions |

---

## Revenue Model

### 1. Affiliate Commissions
Earn commission when customers purchase products through affiliate links to partner retailers.

### 2. Direct Sales
Profit margin on products sold directly through the platform.

### 3. Banner Advertising
Businesses can purchase banner ad placements:
- **Top Position**: £50/week
- **Middle Position**: £35/week
- **Bottom Position**: £25/week

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Customer   │────▶│   Yuumpy    │────▶│  Database   │
│  Browser    │◀────│   Next.js   │◀────│   MySQL     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐           ┌──────▼──────┐
        │ Cloudinary │           │   Stripe    │
        │  (Images)  │           │ (Payments)  │
        └───────────┘           └─────────────┘
```

---

## API Endpoints

### Products
- `GET /api/products` - List products with filtering & pagination
- `GET /api/products/[slug]` - Get single product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[slug]` - Update product (admin)
- `DELETE /api/products/[slug]` - Delete product (admin)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/subcategories` - List subcategories

### Brands
- `GET /api/brands` - List all brands

### Search
- `GET /api/search/suggestions` - Get search suggestions

### Orders (Direct Sales)
- `POST /api/checkout` - Create checkout session
- `GET /api/orders` - List customer orders
- `GET /api/orders/[id]` - Get order details

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/orders` - Manage orders

---

## Security Features

- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: React's built-in escaping
- **Secure Payments**: Stripe handles all payment data
- **Environment Variables**: Sensitive data never exposed to client

---

## Performance Optimizations

- **Image CDN**: Cloudinary automatic optimization and delivery
- **Connection Pooling**: Efficient database connections
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Images load as needed
- **Caching**: Strategic caching for static content

---

## Future Roadmap

- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications for orders
- [ ] Price drop alerts
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

## Summary

Yuumpy provides a seamless shopping experience by:

1. **Aggregating products** from trusted retailers and direct inventory
2. **Providing transparency** on product conditions and pricing
3. **Enabling easy discovery** through search, filters, and categories
4. **Ensuring secure transactions** via Stripe and trusted affiliate partners
5. **Delivering a fast, responsive** experience on any device

The platform benefits customers by saving them time, providing price transparency, and offering a curated selection of products with clear condition labeling.

---

*Document Version: 1.0*  
*Last Updated: December 2025*
