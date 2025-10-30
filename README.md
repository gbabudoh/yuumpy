# Yuumpy - Affiliate Marketplace Platform

A modern, sleek affiliate marketplace platform built with Next.js, featuring a clean UI and best practice UX approach.

## 🚀 Features

### Frontend
- **Modern Homepage**: Beautiful hero section with banner ads, featured products, and categories
- **Product Discovery**: Advanced filtering, search, and sorting capabilities
- **Product Pages**: Detailed product pages with image galleries, ratings, and buy now functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Category Navigation**: Easy browsing by product categories

### Backend & Admin
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Product Management**: Full CRUD operations for products and categories
- **Banner Ad System**: £50/week banner ad placement with Stripe integration
- **Analytics Integration**: Google Analytics and Matomo tracking
- **Image Management**: Cloudinary integration for optimized image storage

### Technical Features
- **Database**: MySQL with optimized schema for products, categories, analytics, and payments
- **Payment Processing**: Stripe integration for banner ad payments
- **Analytics**: Dual tracking with Google Analytics and Matomo
- **Image Optimization**: Cloudinary for automatic image optimization and CDN delivery
- **TypeScript**: Full type safety throughout the application

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MySQL
- **Database**: MySQL with raw queries
- **Payments**: Stripe
- **Images**: Cloudinary
- **Analytics**: Google Analytics + Matomo
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yuumpy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=yuumpy
   DB_PORT=3306

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Analytics Configuration
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com
   NEXT_PUBLIC_MATOMO_SITE_ID=1

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Import the schema
   mysql -u root -p < lib/schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

The application uses MySQL with the following main tables:

- **products**: Product information, pricing, affiliate links
- **categories**: Product categories and organization
- **banner_ads**: Banner advertisement management
- **analytics**: User interaction tracking
- **payments**: Stripe payment records

## 🎨 UI/UX Features

### Design Principles
- **Clean & Modern**: Minimalist design with focus on content
- **Mobile-First**: Responsive design that works on all devices
- **Fast Loading**: Optimized images and lazy loading
- **Accessibility**: WCAG compliant with proper semantic HTML

### Key Components
- **Header**: Navigation with search functionality
- **Product Cards**: Beautiful product displays with hover effects
- **Banner Ads**: Prominent placement for paid advertisements
- **Admin Dashboard**: Comprehensive management interface

## 💰 Banner Ad System

### Pricing Structure
- **Top Position**: £50/week
- **Middle Position**: £35/week  
- **Bottom Position**: £25/week

### Features
- Stripe payment integration
- Automatic ad activation upon payment
- Date range management
- Performance tracking

## 📊 Analytics Integration

### Google Analytics
- Page view tracking
- E-commerce events
- Custom event tracking
- Conversion monitoring

### Matomo Analytics
- Custom event tracking
- User behavior analysis
- Product interaction metrics
- Banner ad performance

## 🚀 Deployment

### Environment Setup
1. Set up MySQL database
2. Configure Cloudinary account
3. Set up Stripe account
4. Configure Google Analytics
5. Set up Matomo instance

### Production Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificates
5. Configure domain and DNS

## 🔧 API Endpoints

### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create new product
- `GET /api/products/[slug]` - Get single product by slug
- `PUT /api/products/[slug]` - Update product by slug
- `DELETE /api/products/[slug]` - Delete product by slug

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Analytics
- `GET /api/analytics` - Get analytics data
- `POST /api/analytics` - Log analytics event

### Banner Ads
- `GET /api/banner-ads` - List banner ads
- `POST /api/banner-ads` - Create banner ad
- `PUT /api/banner-ads/[id]` - Update banner ad
- `DELETE /api/banner-ads/[id]` - Delete banner ad

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

## 🎯 Key Features

### For Users
- Browse products by category
- Search and filter products
- View detailed product information
- Click through to affiliate links
- Responsive mobile experience

### For Admins
- Manage products and categories
- Create and manage banner ads
- View analytics and performance metrics
- Process payments for banner ads
- Monitor user interactions

## 🔒 Security Features

- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure payment processing
- Environment variable protection

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly interactions
- Optimized images for mobile
- Fast loading on slow connections
- Progressive Web App features

## 🚀 Performance Optimizations

- Image optimization with Cloudinary
- Lazy loading for images
- Code splitting with Next.js
- Caching strategies
- Database query optimization

## 📈 Future Enhancements

- User authentication system
- Wishlist functionality
- Product reviews and ratings
- Advanced analytics dashboard
- Email marketing integration
- Multi-language support
- Advanced search with Elasticsearch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS