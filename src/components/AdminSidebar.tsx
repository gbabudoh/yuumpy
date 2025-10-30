'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag,
  Eye,
  MousePointer,
  CreditCard,
  Settings,
  Database,
  FileText,
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  UserCog,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    current: false
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    current: false
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: ShoppingBag,
    current: false
  },
  {
    name: 'Subcategories',
    href: '/admin/subcategories',
    icon: Database,
    current: false
  },
  {
    name: 'Brands',
    href: '/admin/brands',
    icon: Shield,
    current: false
  },
  {
    name: 'Homepage Banner Ads',
    href: '/admin/banner-ads',
    icon: CreditCard,
    current: false
  },
  {
    name: 'Product Banner Ads',
    href: '/admin/product-banner-ads',
    icon: CreditCard,
    current: false
  },
  {
    name: 'About Page',
    href: '/admin/about',
    icon: FileText,
    current: false
  },
  {
    name: 'Advert Page',
    href: '/admin/advert',
    icon: CreditCard,
    current: false
  },
  {
    name: 'Email Inquiries',
    href: '/admin/emails',
    icon: Mail,
    current: false
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'Analytics Settings',
    href: '/admin/analytics/settings',
    icon: Settings,
    current: false
  },
  {
    name: 'SEO Management',
    href: '/admin/seo',
    icon: Search,
    current: false
  },
  {
    name: 'Admin Users',
    href: '/admin/users',
    icon: UserCog,
    current: false
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    current: false
  },


];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">Yuumpy Admin</h1>
            <p className="text-sm text-gray-400">Control Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors group cursor-pointer ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: '#8827ee' } : {}}
              >
                <item.icon className={`${collapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} cursor-pointer hover:cursor-pointer`} style={{ cursor: 'pointer' }} />
                {!collapsed && (
                  <span className="font-medium cursor-pointer">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="mt-8 px-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Products</span>
                <span className="text-white font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categories</span>
                <span className="text-white font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Brands</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400 font-medium">£12.4K</span>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
