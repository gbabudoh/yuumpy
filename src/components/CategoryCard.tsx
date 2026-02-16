import Link from 'next/link';
import Image from 'next/image';

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

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/products/${category.slug}`}
      className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-3 sm:p-4 md:p-6 text-center">
        <div className="mb-3 md:mb-4 bg-gray-50 rounded-2xl p-4 md:p-6 group-hover:bg-blue-50 transition-colors duration-300">
          {category.icon_url ? (
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 mx-auto">
              <Image 
                src={category.icon_url} 
                alt={`${category.name} icon`}
                fill
                sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 96px"
                className="object-contain group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 mx-auto bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                {category.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-sm md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1 mb-1">
          {category.name.replace(/00/g, '')}
        </h3>
        <p className="text-[10px] md:text-sm text-gray-500 mb-2 md:mb-3 line-clamp-2 md:line-clamp-none h-6 md:h-auto">
          {category.description || `Browse our collection of ${category.name}`}
        </p>
        
        <div className="inline-flex items-center text-[10px] md:text-sm font-semibold text-blue-600">
          <span>{category.product_count} Products</span>
          <svg className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
