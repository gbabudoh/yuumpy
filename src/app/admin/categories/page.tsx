'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Package, Filter, Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon_url: string;
  parent_id: number | null;
  parent_name: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    sort_order: 0,
    is_active: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [selectedIconType, setSelectedIconType] = useState<'emoji' | 'upload'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');

  // Predefined emoji icons - Comprehensive Collection
  const predefinedIcons = [
    // Shopping & Commerce
    { name: 'Package', emoji: '📦' },
    { name: 'Shopping Cart', emoji: '🛒' },
    { name: 'Shopping Bag', emoji: '🛍️' },
    { name: 'Credit Card', emoji: '💳' },
    { name: 'Money', emoji: '💰' },
    { name: 'Gift', emoji: '🎁' },
    { name: 'Store', emoji: '🏪' },
    { name: 'Tag', emoji: '🏷️' },
    
    // Fashion & Clothing
    { name: 'Fashion', emoji: '👗' },
    { name: 'Shirt', emoji: '👕' },
    { name: 'Jeans', emoji: '👖' },
    { name: 'Shoes', emoji: '👟' },
    { name: 'Hat', emoji: '👒' },
    { name: 'Sunglasses', emoji: '🕶️' },
    { name: 'Watch', emoji: '⌚' },
    { name: 'Ring', emoji: '💍' },
    { name: 'Handbag', emoji: '👜' },
    { name: 'Backpack', emoji: '🎒' },
    
    // Electronics & Technology
    { name: 'Electronics', emoji: '📱' },
    { name: 'Computer', emoji: '💻' },
    { name: 'Desktop', emoji: '🖥️' },
    { name: 'Keyboard', emoji: '⌨️' },
    { name: 'Mouse', emoji: '🖱️' },
    { name: 'Camera', emoji: '📷' },
    { name: 'Headphones', emoji: '🎧' },
    { name: 'Speaker', emoji: '🔊' },
    { name: 'TV', emoji: '📺' },
    { name: 'Radio', emoji: '📻' },
    { name: 'Battery', emoji: '🔋' },
    { name: 'Electric Plug', emoji: '🔌' },
    { name: 'Gadgets', emoji: '⚡' },
    { name: 'Robot', emoji: '🤖' },
    
    // Beauty & Personal Care
    { name: 'Beauty', emoji: '💄' },
    { name: 'Nail Polish', emoji: '💅' },
    { name: 'Mirror', emoji: '🪞' },
    { name: 'Perfume', emoji: '🧴' },
    { name: 'Soap', emoji: '🧼' },
    { name: 'Toothbrush', emoji: '🪥' },
    { name: 'Razor', emoji: '🪒' },
    { name: 'Hairbrush', emoji: '🪮' },
    
    // Home & Living
    { name: 'Home', emoji: '🏠' },
    { name: 'Furniture', emoji: '🪑' },
    { name: 'Bed', emoji: '🛏️' },
    { name: 'Couch', emoji: '🛋️' },
    { name: 'Lamp', emoji: '💡' },
    { name: 'Candle', emoji: '🕯️' },
    { name: 'Frame', emoji: '🖼️' },
    { name: 'Clock', emoji: '🕐' },
    { name: 'Key', emoji: '🔑' },
    { name: 'Door', emoji: '🚪' },
    { name: 'Window', emoji: '🪟' },
    { name: 'Toilet', emoji: '🚽' },
    { name: 'Shower', emoji: '🚿' },
    
    // Kitchen & Dining
    { name: 'Kitchen', emoji: '🍳' },
    { name: 'Refrigerator', emoji: '🧊' },
    { name: 'Microwave', emoji: '📱' },
    { name: 'Coffee', emoji: '☕' },
    { name: 'Wine', emoji: '🍷' },
    { name: 'Fork & Knife', emoji: '🍴' },
    { name: 'Spoon', emoji: '🥄' },
    { name: 'Plate', emoji: '🍽️' },
    { name: 'Cup', emoji: '🥤' },
    
    // Food & Beverages
    { name: 'Food', emoji: '🍎' },
    { name: 'Bread', emoji: '🍞' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Meat', emoji: '🥩' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Burger', emoji: '🍔' },
    { name: 'Cake', emoji: '🎂' },
    { name: 'Ice Cream', emoji: '🍦' },
    { name: 'Candy', emoji: '🍬' },
    
    // Health & Wellness
    { name: 'Health', emoji: '🌿' },
    { name: 'Medicine', emoji: '💊' },
    { name: 'Syringe', emoji: '💉' },
    { name: 'Thermometer', emoji: '🌡️' },
    { name: 'Stethoscope', emoji: '🩺' },
    { name: 'Bandage', emoji: '🩹' },
    { name: 'Yoga', emoji: '🧘' },
    { name: 'Dumbbell', emoji: '🏋️' },
    
    // Sports & Fitness
    { name: 'Sports', emoji: '⚽' },
    { name: 'Basketball', emoji: '🏀' },
    { name: 'Tennis', emoji: '🎾' },
    { name: 'Baseball', emoji: '⚾' },
    { name: 'Golf', emoji: '⛳' },
    { name: 'Swimming', emoji: '🏊' },
    { name: 'Cycling', emoji: '🚴' },
    { name: 'Running', emoji: '🏃' },
    { name: 'Trophy', emoji: '🏆' },
    { name: 'Medal', emoji: '🥇' },
    
    // Garden & Outdoor
    { name: 'Garden', emoji: '🌱' },
    { name: 'Tree', emoji: '🌳' },
    { name: 'Flower', emoji: '🌸' },
    { name: 'Rose', emoji: '🌹' },
    { name: 'Sunflower', emoji: '🌻' },
    { name: 'Cactus', emoji: '🌵' },
    { name: 'Leaf', emoji: '🍃' },
    { name: 'Seedling', emoji: '🌱' },
    { name: 'Watering Can', emoji: '🪣' },
    
    // Toys & Games
    { name: 'Toys', emoji: '🎮' },
    { name: 'Teddy Bear', emoji: '🧸' },
    { name: 'Puzzle', emoji: '🧩' },
    { name: 'Dice', emoji: '🎲' },
    { name: 'Chess', emoji: '♟️' },
    { name: 'Balloon', emoji: '🎈' },
    { name: 'Kite', emoji: '🪁' },
    { name: 'Yo-yo', emoji: '🪀' },
    
    // Pet Supplies
    { name: 'Pet Supplies', emoji: '🦴' },
    { name: 'Dog', emoji: '🐕' },
    { name: 'Cat', emoji: '🐱' },
    { name: 'Fish', emoji: '🐠' },
    { name: 'Bird', emoji: '🐦' },
    { name: 'Rabbit', emoji: '🐰' },
    { name: 'Paw Print', emoji: '🐾' },
    
    // Books & Education
    { name: 'Books', emoji: '📚' },
    { name: 'Book', emoji: '📖' },
    { name: 'Notebook', emoji: '📓' },
    { name: 'Pencil', emoji: '✏️' },
    { name: 'Pen', emoji: '🖊️' },
    { name: 'Graduation', emoji: '🎓' },
    { name: 'School', emoji: '🏫' },
    { name: 'Backpack', emoji: '🎒' },
    
    // Music & Entertainment
    { name: 'Music', emoji: '🎵' },
    { name: 'Guitar', emoji: '🎸' },
    { name: 'Piano', emoji: '🎹' },
    { name: 'Microphone', emoji: '🎤' },
    { name: 'Headphones', emoji: '🎧' },
    { name: 'CD', emoji: '💿' },
    { name: 'Movie', emoji: '🎬' },
    { name: 'Theater', emoji: '🎭' },
    
    // Travel & Transportation
    { name: 'Travel', emoji: '✈️' },
    { name: 'Car', emoji: '🚗' },
    { name: 'Bus', emoji: '🚌' },
    { name: 'Train', emoji: '🚆' },
    { name: 'Bike', emoji: '🚲' },
    { name: 'Boat', emoji: '⛵' },
    { name: 'Luggage', emoji: '🧳' },
    { name: 'Map', emoji: '🗺️' },
    { name: 'Compass', emoji: '🧭' },
    
    // Art & Creativity
    { name: 'Art', emoji: '🎨' },
    { name: 'Paintbrush', emoji: '🖌️' },
    { name: 'Crayon', emoji: '🖍️' },
    { name: 'Palette', emoji: '🎨' },
    { name: 'Camera', emoji: '📸' },
    { name: 'Scissors', emoji: '✂️' },
    { name: 'Glue', emoji: '🧴' },
    
    // Tools & Hardware
    { name: 'Tools', emoji: '🔧' },
    { name: 'Hammer', emoji: '🔨' },
    { name: 'Screwdriver', emoji: '🪛' },
    { name: 'Wrench', emoji: '🔧' },
    { name: 'Saw', emoji: '🪚' },
    { name: 'Drill', emoji: '🪚' },
    { name: 'Toolbox', emoji: '🧰' },
    { name: 'Nut & Bolt', emoji: '🔩' },
    { name: 'Gear', emoji: '⚙️' },
    
    // Office & Business
    { name: 'Office', emoji: '🏢' },
    { name: 'Briefcase', emoji: '💼' },
    { name: 'Calculator', emoji: '🧮' },
    { name: 'Chart', emoji: '📊' },
    { name: 'Calendar', emoji: '📅' },
    { name: 'Clipboard', emoji: '📋' },
    { name: 'File', emoji: '📁' },
    { name: 'Printer', emoji: '🖨️' },
    { name: 'Fax', emoji: '📠' },
    
    // Miscellaneous
    { name: 'Star', emoji: '⭐' },
    { name: 'Heart', emoji: '❤️' },
    { name: 'Diamond', emoji: '💎' },
    { name: 'Crown', emoji: '👑' },
    { name: 'Fire', emoji: '🔥' },
    { name: 'Lightning', emoji: '⚡' },
    { name: 'Rainbow', emoji: '🌈' },
    { name: 'Sun', emoji: '☀️' },
    { name: 'Moon', emoji: '🌙' },
    { name: 'Earth', emoji: '🌍' },
    { name: 'Rocket', emoji: '🚀' },
    { name: 'Alien', emoji: '👽' }
  ];

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories?parent_only=true');
      if (response.ok) {
        const data = await response.json();
        setParentCategories(data);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const generateUniqueSlug = async (baseSlug: string, excludeId?: number): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const response = await fetch(`/api/categories/check-slug?slug=${slug}${excludeId ? `&exclude=${excludeId}` : ''}`);
      const data = await response.json();

      if (!data.exists) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add loading state to prevent double submissions
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = editingCategory ? 'Updating...' : 'Creating...';
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      // Handle image upload
      let imageUrl = '';
      if (selectedImage) {
        // Convert image to base64 synchronously
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string || '');
          };
          reader.readAsDataURL(selectedImage);
        });
      } else if (editingCategory) {
        // Keep existing image if no new image selected
        imageUrl = editingCategory.image_url || '';
      }

      // Handle icon with smart validation
      let iconUrl = '';
      if (selectedIconType === 'emoji') {
        // Use emoji as icon (safe - always short)
        iconUrl = selectedEmoji;
      } else if (selectedIconType === 'upload' && selectedIcon) {
        // Check file size before processing
        if (selectedIcon.size > 50 * 1024) { // 50KB limit
          alert('Icon file is too large. Please use a smaller image (max 50KB) or choose an emoji icon.');
          return;
        }

        // Use the optimized image from preview (already processed for quality)
        if (iconPreview) {
          iconUrl = iconPreview;

          // Validate the optimized image size
          if (iconUrl.length > 15000) {
            alert(`Optimized image is still too large (${iconUrl.length} chars). Please use a simpler image or emoji icon.`);
            return;
          }
        } else {
          alert('Please wait for image processing to complete.');
          return;
        }
      } else if (editingCategory) {
        // Keep existing icon if no new icon selected
        iconUrl = editingCategory.icon_url || '';
      }

      // Final validation on icon URL length
      if (iconUrl && iconUrl.length > 15000) {
        alert('Icon data is too large for database. Please use an emoji icon or a much smaller image.');
        return;
      }

      // Generate unique slug if needed
      const uniqueSlug = await generateUniqueSlug(formData.slug, editingCategory?.id);

      // Ensure all fields are properly formatted
      const requestBody = {
        name: formData.name.trim(),
        slug: uniqueSlug,
        description: (formData.description || '').trim(),
        image_url: imageUrl || '',
        icon_url: iconUrl || '',
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        sort_order: parseInt(formData.sort_order?.toString() || '0'),
        is_active: Boolean(formData.is_active)
      };

      // Validate required fields
      if (!requestBody.name || !requestBody.slug) {
        throw new Error('Name and slug are required');
      }

      console.log('Sending request:', { url, method, body: requestBody });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        // Parse the success response
        let result;
        try {
          result = await response.json();
          console.log('Success response:', result);
        } catch (parseError) {
          console.log('Success response (no JSON):', response.statusText);
          result = { success: true };
        }

        // Refresh the categories list
        await fetchCategories();

        // Reset the form
        resetForm();

        // Show success message
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      } else {
        // Handle error response
        let errorData;
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);

          if (responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              errorData = { error: responseText };
            }
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (fetchError) {
          console.error('Failed to read error response:', fetchError);
          errorData = { error: `HTTP ${response.status}: Unable to read error details` };
        }

        console.error('API Error:', errorData);
        alert(errorData.error || `Failed to save category (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error instanceof Error ? error.message : 'An unexpected error occurred while saving the category');
    } finally {
      // Re-enable the submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = editingCategory ? 'Update Category' : 'Add Category';
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    });
    setImagePreview(category.image_url);
    setSelectedImage(null);

    // Handle icon editing - detect emoji vs uploaded image
    if (category.icon_url) {
      if (category.icon_url.length <= 4) {
        // It's an emoji
        setSelectedIconType('emoji');
        setSelectedEmoji(category.icon_url);
        setIconPreview(null);
      } else {
        // It's an uploaded image
        setSelectedIconType('upload');
        setIconPreview(category.icon_url);
        setSelectedEmoji('📦');
      }
    } else {
      // No icon - default to emoji
      setSelectedIconType('emoji');
      setSelectedEmoji('📦');
      setIconPreview(null);
    }

    setSelectedIcon(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
          alert('Category deleted successfully!');
          fetchCategories();
        } else {
          alert(data.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('An error occurred while deleting the category');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type first
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        e.target.value = ''; // Clear the input
        return;
      }

      // Allow larger original files since we'll optimize them
      if (file.size > 500 * 1024) { // 500KB limit for original file
        alert('Original image file is too large. Please choose an image under 500KB.');
        e.target.value = ''; // Clear the input
        return;
      }

      setSelectedIcon(file);

      // Process image for better quality and smaller size
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to optimal icon size
        const targetSize = 96;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Enable image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image with high quality scaling
          ctx.drawImage(img, 0, 0, targetSize, targetSize);

          // Try different compression levels to find the best balance
          let optimizedDataUrl = '';
          let quality = 0.9;

          // Start with JPEG for smaller file size, fallback to PNG if needed
          do {
            optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
            quality -= 0.1;
          } while (optimizedDataUrl.length > 8000 && quality > 0.3); // Target ~6KB base64

          // If JPEG is still too large or we need transparency, try PNG with lower quality
          if (optimizedDataUrl.length > 8000) {
            optimizedDataUrl = canvas.toDataURL('image/png');
          }

          setIconPreview(optimizedDataUrl);

          // Show optimization info
          const originalSizeKB = Math.round(file.size / 1024);
          const optimizedSizeKB = Math.round(optimizedDataUrl.length / 1024);
          console.log(`Icon optimized: ${originalSizeKB}KB → ${optimizedSizeKB}KB (96×96px)`);

          // Warn if still too large
          if (optimizedDataUrl.length > 10000) {
            alert(`Optimized image is still large (${optimizedSizeKB}KB). Consider using a simpler image or emoji icon for best results.`);
          }
        }
      };

      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setSelectedIconType('emoji');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      sort_order: 0,
      is_active: true
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedIcon(null);
    setIconPreview(null);
    setSelectedIconType('emoji');
    setSelectedEmoji('📦');
    setEditingCategory(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter(category => {
    // Only show main categories (no subcategories)
    const isMainCategory = category.parent_id === null;
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    return isMainCategory && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Manage product categories and sub-categories</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer hover:bg-purple-700"
            style={{ backgroundColor: '#8827ee' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="">Main Categories Only</option>
              {parentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredCategories.length} categories
              </span>
            </div>
          </div>
        </div>

        {/* Main Categories Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Main Categories</h2>
          <p className="text-gray-600 text-sm">Your primary product categories</p>
        </div>

        {/* Categories Grid - Professional Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Display category icon */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {category.icon_url ? (
                        category.icon_url.startsWith('data:image/') ? (
                          <img
                            src={category.icon_url}
                            alt={`${category.name} icon`}
                            className="w-10 h-10 object-contain"
                            style={{
                              imageRendering: 'crisp-edges'
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-2xl">{category.icon_url}</span>
                        )
                      ) : (
                        <span className="text-2xl text-gray-400">📦</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>



                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{category.product_count}</span> products
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first category</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-white px-6 py-3 rounded-lg transition-colors cursor-pointer hover:bg-purple-700"
              style={{ backgroundColor: '#8827ee' }}
            >
              Add Category
            </button>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Type Selection */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What would you like to create?</h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="categoryType"
                          value="main"
                          checked={!formData.parent_id}
                          onChange={() => setFormData({ ...formData, parent_id: '' })}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">New Main Category</div>
                          <div className="text-sm text-gray-600">Create a new primary category</div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="categoryType"
                          value="sub"
                          checked={!!formData.parent_id}
                          onChange={() => setFormData({ ...formData, parent_id: parentCategories[0]?.id.toString() || '' })}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">New Sub Category</div>
                          <div className="text-sm text-gray-600">Add under existing category</div>
                        </div>
                      </label>
                    </div>

                    {/* Main Category Form */}
                    {!formData.parent_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            setFormData({ ...formData, name, slug });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="e.g., Electronics, Fashion, Sports"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Example:</strong> Electronics, Fashion, Home & Garden
                        </p>
                      </div>
                    )}

                    {/* Sub Category Form */}
                    {formData.parent_id && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Main Category *
                          </label>
                          <select
                            required
                            value={formData.parent_id}
                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          >
                            <option value="">Select Main Category</option>
                            {parentCategories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sub Category Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                              setFormData({ ...formData, name, slug });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="e.g., Mobile Phone, Laptops"
                          />
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    {formData.name && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        {formData.parent_id ? (
                          <p className="text-sm text-green-800">
                            <strong>Preview:</strong> {parentCategories.find(c => c.id.toString() === formData.parent_id)?.name} → {formData.name}
                          </p>
                        ) : (
                          <p className="text-sm text-green-800">
                            <strong>Preview:</strong> {formData.name} (Main Category)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Auto-generated slug display */}
                  {formData.slug && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="mobile-phone"
                      />
                    </div>
                  )}

                  {/* Optional Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter category description"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category Icon
                    </label>

                    {/* Icon Type Selection */}
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="iconType"
                          value="emoji"
                          checked={selectedIconType === 'emoji'}
                          onChange={() => setSelectedIconType('emoji')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Emoji Icon (Recommended)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="iconType"
                          value="upload"
                          checked={selectedIconType === 'upload'}
                          onChange={() => setSelectedIconType('upload')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Upload Small Icon</span>
                      </label>
                    </div>

                    {/* Emoji Selection */}
                    {selectedIconType === 'emoji' && (
                      <div>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {predefinedIcons.map((icon, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleEmojiSelect(icon.emoji)}
                              className={`p-3 text-2xl rounded-lg border-2 transition-colors cursor-pointer ${selectedEmoji === icon.emoji
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                              title={icon.name}
                            >
                              {icon.emoji}
                            </button>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          Selected: <span className="text-2xl">{selectedEmoji}</span>
                        </div>
                      </div>
                    )}

                    {/* Icon Upload */}
                    {selectedIconType === 'upload' && (
                      <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800 mb-2">
                            <strong>📐 For Sharp, High-Quality Icons:</strong>
                          </p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• <strong>Original size:</strong> Any size up to 500KB (will be optimized)</li>
                            <li>• <strong>Output:</strong> Automatically resized to 96×96px</li>
                            <li>• <strong>Format:</strong> Any image format (PNG, JPG, etc.)</li>
                            <li>• <strong>Style:</strong> Simple, bold design with high contrast</li>
                            <li>• <strong>Optimization:</strong> Automatic compression for best quality/size balance</li>
                          </ul>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {iconPreview && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Icon Preview:</p>
                            <img
                              src={iconPreview}
                              alt="Icon preview"
                              className="w-16 h-16 object-contain border border-gray-300 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg transition-colors cursor-pointer hover:bg-purple-700"
                      style={{ backgroundColor: '#8827ee' }}
                    >
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
