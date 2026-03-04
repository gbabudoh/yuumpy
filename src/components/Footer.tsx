'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FooterSetting {
  key_name: string;
  value: string;
}

export default function Footer() {
  const [settings, setSettings] = useState({
    homepage_tagline: 'Your premier affiliate marketplace platform. Discover amazing products and earn through our network.',
    site_title: 'Yuumpy',
    site_description: 'Premier affiliate marketplace platform',
    contact_email: 'info@yuumpy.com',
    contact_phone: '+44 20 1234 5678',
    contact_location: 'London, UK',
    social_instagram: '#',
    social_facebook: '#',
    social_twitter: '#',
    social_linkedin: '#'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const settingsData: FooterSetting[] = await response.json();
          const settingsMap: { [key: string]: string } = {};
          settingsData.forEach((setting) => {
            settingsMap[setting.key_name] = setting.value;
          });
          setSettings(prevSettings => ({
            ...prevSettings,
            ...settingsMap
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);
  return (
    <footer className="bg-gray-100 text-gray-900 pt-24 pb-12 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.png"
                alt="Yuumpy Logo"
                width={70}
                height={28}
                className="h-5 w-auto"
              />
            </Link>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              {settings.homepage_tagline}
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Instagram', url: settings.social_instagram },
                { name: 'Facebook', url: settings.social_facebook },
                { name: 'X', url: settings.social_twitter },
                { name: 'LinkedIn', url: settings.social_linkedin }
              ].map((social) => (
                <a key={social.name} href={social.url} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-500 border border-gray-200 cursor-pointer">
                  <span className="sr-only">{social.name}</span>
                  <div className="w-5 h-5 flex items-center justify-center font-black text-xs">
                    {social.name[0]}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-8">Navigation</h3>
            <ul className="space-y-4">
              {['Products', 'Categories', 'Sell on Yuumpy', 'About Yuumpy'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-gray-500 hover:text-gray-900 transition-all hover:translate-x-2 inline-block font-bold cursor-pointer">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-8">Trust & Safety</h3>
            <ul className="space-y-4">
              {['Escrow Policy', 'Buyer Guarantee', 'Seller Verification', 'Dispute Resolution'].map((item) => (
                <li key={item}>
                  <Link href={`/support/${item.toLowerCase().replace(/ /g, '-')}`} className="text-gray-500 hover:text-gray-900 transition-all hover:translate-x-2 inline-block font-bold cursor-pointer">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-8">Get in Touch</h3>
            <div className="space-y-6">
              <div className="group flex items-center gap-4">
                <div className="w-12 h-12 rounded-3xl bg-white shadow-sm flex items-center justify-center border border-gray-200 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                  <p className="text-gray-700 font-bold">{settings.contact_email}</p>
                </div>
              </div>
              <div className="group flex items-center gap-4">
                <div className="w-12 h-12 rounded-3xl bg-white shadow-sm flex items-center justify-center border border-gray-200 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direct Support</p>
                  <p className="text-gray-700 font-bold">{settings.contact_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 font-bold text-sm">
            © 2025 Yuumpy. <span className="text-indigo-500/50 italic">Crafted for Excellence.</span>
          </p>
          <div className="flex gap-10">
            <Link href="/privacy" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">Privacy</Link>
            <Link href="/terms" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">Terms</Link>
            <Link href="/cookies" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
