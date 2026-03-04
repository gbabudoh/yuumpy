import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flower2, Palette, ShoppingBag, Sparkles, Flame, Wind, Sofa, Gamepad2, TreePine, Gift, Home, Gem, UtensilsCrossed, Tag, Bone, Landmark, Leaf, Shirt, Heart, Smartphone, Monitor, Apple, Package, type LucideIcon } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon_url?: string;
  product_count: number;
  is_active: boolean;
}

interface CategoryCardProps {
  category: Category;
}

const isImageUrl = (str: string) => {
  return str.startsWith('data:image/') || str.startsWith('http') || str.startsWith('/') || str.startsWith('.');
};

const getCategoryIcon = (categoryName: string): LucideIcon => {
  const name = categoryName.toLowerCase();
  if (name.includes('aromatherapy')) return Flower2;
  if (name.includes('arts') || name.includes('crafts')) return Palette;
  if (name.includes('bags')) return ShoppingBag;
  if (name.includes('beauty')) return Sparkles;
  if (name.includes('candles')) return Flame;
  if (name.includes('drinkware')) return Apple;
  if (name.includes('fragrance')) return Wind;
  if (name.includes('furniture')) return Sofa;
  if (name.includes('games') || name.includes('toys')) return Gamepad2;
  if (name.includes('garden') || name.includes('outdoor')) return TreePine;
  if (name.includes('gifts')) return Gift;
  if (name.includes('home decor')) return Home;
  if (name.includes('jewellery')) return Gem;
  if (name.includes('kitchen') || name.includes('dining')) return UtensilsCrossed;
  if (name.includes('licensed') || name.includes('collections')) return Tag;
  if (name.includes('pet')) return Bone;
  if (name.includes('souvenirs')) return Landmark;
  if (name.includes('tea')) return Leaf;
  if (name.includes('unique')) return Sparkles;
  if (name.includes('wearables') || name.includes('fashion')) return Shirt;
  if (name.includes('wellness') || name.includes('self-care')) return Heart;
  if (name.includes('electronics')) return Smartphone;
  if (name.includes('digital')) return Monitor;
  if (name.includes('other')) return Package;
  return Package;
};

const iconColors: Record<string, { bg: string; text: string; ring: string }> = {
  aromatherapy: { bg: 'bg-pink-50', text: 'text-pink-500', ring: 'group-hover:ring-pink-200' },
  arts: { bg: 'bg-orange-50', text: 'text-orange-500', ring: 'group-hover:ring-orange-200' },
  bags: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200' },
  beauty: { bg: 'bg-rose-50', text: 'text-rose-500', ring: 'group-hover:ring-rose-200' },
  candles: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'group-hover:ring-yellow-200' },
  drinkware: { bg: 'bg-sky-50', text: 'text-sky-500', ring: 'group-hover:ring-sky-200' },
  fragrance: { bg: 'bg-violet-50', text: 'text-violet-500', ring: 'group-hover:ring-violet-200' },
  furniture: { bg: 'bg-stone-100', text: 'text-stone-600', ring: 'group-hover:ring-stone-200' },
  games: { bg: 'bg-indigo-50', text: 'text-indigo-500', ring: 'group-hover:ring-indigo-200' },
  garden: { bg: 'bg-emerald-50', text: 'text-emerald-500', ring: 'group-hover:ring-emerald-200' },
  gifts: { bg: 'bg-red-50', text: 'text-red-500', ring: 'group-hover:ring-red-200' },
  home: { bg: 'bg-teal-50', text: 'text-teal-500', ring: 'group-hover:ring-teal-200' },
  jewellery: { bg: 'bg-purple-50', text: 'text-purple-500', ring: 'group-hover:ring-purple-200' },
  kitchen: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'group-hover:ring-orange-200' },
  licensed: { bg: 'bg-blue-50', text: 'text-blue-500', ring: 'group-hover:ring-blue-200' },
  pet: { bg: 'bg-lime-50', text: 'text-lime-600', ring: 'group-hover:ring-lime-200' },
  souvenirs: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'group-hover:ring-cyan-200' },
  tea: { bg: 'bg-green-50', text: 'text-green-600', ring: 'group-hover:ring-green-200' },
  unique: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-500', ring: 'group-hover:ring-fuchsia-200' },
  wearables: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'group-hover:ring-slate-200' },
  wellness: { bg: 'bg-pink-50', text: 'text-pink-500', ring: 'group-hover:ring-pink-200' },
  default: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'group-hover:ring-gray-200' },
};

function getColorKey(name: string): string {
  const n = name.toLowerCase();
  for (const key of Object.keys(iconColors)) {
    if (key !== 'default' && n.includes(key)) return key;
  }
  return 'default';
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const hasImage = category.icon_url && isImageUrl(category.icon_url);
  const Icon = getCategoryIcon(category.name);
  const colorKey = getColorKey(category.name);
  const colors = iconColors[colorKey] || iconColors.default;

  return (
    <Link
      href={`/products/${category.slug}`}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 cursor-pointer"
    >
      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ring-1 ring-transparent ${colors.ring} transition-all duration-300`}>
          {hasImage ? (
            <div className="relative w-6 h-6">
              <Image
                src={category.icon_url!}
                alt={`${category.name} icon`}
                fill
                sizes="24px"
                className="object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <Icon className={`w-5 h-5 ${colors.text}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
            {category.name.replace(/00/g, '')}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
