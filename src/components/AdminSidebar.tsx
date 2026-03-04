'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingBag,
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
  ShoppingCart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  permission: string | null;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    current: false,
    permission: null
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    current: false,
    permission: 'can_manage_products'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    current: false,
    permission: 'can_manage_orders'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    current: false,
    permission: 'can_manage_customers'
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: ShoppingBag,
    current: false,
    permission: 'can_manage_categories'
  },
  {
    name: 'Subcategories',
    href: '/admin/subcategories',
    icon: Database,
    current: false,
    permission: 'can_manage_subcategories'
  },
  {
    name: 'Brands',
    href: '/admin/brands',
    icon: Shield,
    current: false,
    permission: 'can_manage_brands'
  },
  {
    name: 'Homepage Banner Ads',
    href: '/admin/banner-ads',
    icon: CreditCard,
    current: false,
    permission: 'can_manage_banner_ads'
  },
  {
    name: 'Product Banner Ads',
    href: '/admin/product-banner-ads',
    icon: CreditCard,
    current: false,
    permission: 'can_manage_product_banner_ads'
  },
  {
    name: 'About Page',
    href: '/admin/about',
    icon: FileText,
    current: false,
    permission: 'can_manage_pages'
  },
  {
    name: 'Advert Page',
    href: '/admin/advert',
    icon: CreditCard,
    current: false,
    permission: 'can_manage_pages'
  },
  {
    name: 'Email Inquiries',
    href: '/admin/emails',
    icon: Mail,
    current: false,
    permission: 'can_manage_emails'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
    permission: 'can_manage_analytics'
  },
  {
    name: 'Analytics Settings',
    href: '/admin/analytics/settings',
    icon: Settings,
    current: false,
    permission: 'can_manage_analytics'
  },
  {
    name: 'SEO Management',
    href: '/admin/seo',
    icon: Search,
    current: false,
    permission: 'can_manage_seo'
  },
  {
    name: 'Admin Users',
    href: '/admin/users',
    icon: UserCog,
    current: false,
    permission: 'can_manage_users'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    current: false,
    permission: 'can_manage_settings'
  },
  {
    name: 'Sellers',
    href: '/admin/sellers',
    icon: UserCog,
    current: false,
    permission: 'can_manage_users'
  },
  {
    name: 'Commission',
    href: '/admin/commission',
    icon: CreditCard,
    current: false,
    permission: 'can_manage_orders'
  },
  {
    name: 'Escrow',
    href: '/admin/escrow',
    icon: Shield,
    current: false,
    permission: 'can_manage_orders'
  },
  {
    name: 'Disputes',
    href: '/admin/disputes',
    icon: Shield,
    current: false,
    permission: 'can_manage_orders'
  },

];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Get permissions from localStorage where it was stored during login
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setUserPermissions(user.permissions);
      } catch (e) {
        console.error('Error parsing admin user:', e);
      }
    }
  }, []);

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;
    if (!userPermissions) return true; // Show all until permissions are loaded or if not found
    return userPermissions[item.permission] === true;
  });

  return (
    <div className={`bg-white border-r border-slate-100 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} flex-shrink-0 flex flex-col h-screen sticky top-0 z-40`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6">
        {!collapsed && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Yuumpy Admin</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Enterprise Control</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer relative ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'
              }`}
            >
              <item.icon className={`${collapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} transition-transform group-hover:scale-110`} />
              {!collapsed && (
                <span className="text-sm font-bold tracking-tight">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <div className="absolute right-4 w-1 h-4 bg-white/30 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Status</h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Inventory', value: '0', color: 'text-slate-600' },
                { label: 'Active Cats', value: '0', color: 'text-slate-600' },
                { label: 'Daily Rev', value: '£0', color: 'text-purple-600' }
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-white/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</span>
                  <span className={`text-xs font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
