import Link from 'next/link';

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

// Function to get the appropriate emoji icon for each category
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('fashion')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">👗</span>;
  }
  if (name.includes('electronics')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">📱</span>;
  }
  if (name.includes('beauty') || name.includes('personal care')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">💄</span>;
  }
  if (name.includes('digital') || name.includes('services')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">💻</span>;
  }
  if (name.includes('garden') || name.includes('outdoor')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">🌱</span>;
  }
  if (name.includes('home') || name.includes('living')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">🏠</span>;
  }
  if (name.includes('pet') || name.includes('supplies')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">🦴</span>;
  }
  if (name.includes('sports') || name.includes('leisure')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">⚽</span>;
  }
  if (name.includes('health') || name.includes('wellness')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">🌿</span>;
  }
  if (name.includes('toys') || name.includes('hobbies')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">🎮</span>;
  }
  if (name.includes('gadgets')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">⚡</span>;
  }
  if (name.includes('others')) {
    return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">📋</span>;
  }
  
  // Default icon
  return <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">📋</span>;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${category.slug}`}
      className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-3 sm:p-4 md:p-6 text-center">
        {/* Category Icon */}
        <div className="mb-2 sm:mb-3 md:mb-4">
          {category.icon_url ? (
            // Check if it's a base64 image or emoji
            category.icon_url.startsWith('data:image/') ? (
              <img 
                src={category.icon_url} 
                alt={`${category.name} icon`}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
                style={{
                  imageRendering: 'crisp-edges'
                }}
                loading="lazy"
                decoding="async"
                alt=""
              />
            ) : (
              <span className="text-3xl sm:text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                {category.icon_url}
              </span>
            )
          ) : (
            getCategoryIcon(category.name)
          )}
        </div>
        
        {/* Category Name */}
        <h3 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {category.name}
        </h3>
        
        {/* Product Count */}
        <p className="text-xs sm:text-sm text-gray-600">
          {category.product_count} products
        </p>
      </div>
    </Link>
  );
}
