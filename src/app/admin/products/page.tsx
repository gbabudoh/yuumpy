'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Package, Filter, Search, Trash2, ChevronDown, Upload, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

declare global {
  interface Window {
    allCategories: Category[];
  }
}

interface ColorOption {
  name: string;
  image_url?: string;
  gallery?: string[] | string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  short_description: string;
  long_description?: string;
  product_review?: string;
  affiliate_url: string;
  affiliate_partner_name?: string;
  external_purchase_info?: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
  stock_quantity?: number;
  image_url: string;
  gallery?: string[];
  colors?: string | string[] | ColorOption[] | null;
  category_name: string;
  category_id?: number;
  subcategory_id?: number;
  brand_id?: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  // Banner ad fields
  banner_ad_title?: string;
  banner_ad_description?: string;
  banner_ad_image_url?: string;
  banner_ad_link_url?: string;
  banner_ad_duration?: '1_week' | '2_weeks' | '3_weeks' | '4_weeks' | '6_months';
  banner_ad_is_repeating?: boolean;
  banner_ad_start_date?: string;
  banner_ad_end_date?: string;
  banner_ad_is_active?: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  category_id?: number;
}

interface Brand {
  id: number;
  name: string;
}

interface VariationForm {
  id?: number;
  colour_name: string;
  colour_hex: string;
  main_image_url: string;
  gallery_images: string[];
  main_image_file: File | null;
  gallery_files: File[];
  saved: boolean;
  saving: boolean;
}

const PREDEFINED_COLOURS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Beige', hex: '#D2B48C' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Mint', hex: '#98FF98' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Space Grey', hex: '#4A4A4A' },
  { name: 'Midnight', hex: '#191970' },
  { name: 'Cream', hex: '#FFFDD0' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    short_description: '',
    long_description: '',
    product_review: '',
    affiliate_url: '',
    affiliate_partner_name: '',
    external_purchase_info: '',
    purchase_type: 'affiliate' as 'affiliate' | 'direct',
    product_condition: 'new' as 'new' | 'refurbished' | 'used',
    stock_quantity: '',
    colors: [] as ColorOption[],
    main_category_id: '',
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    is_featured: false,
    is_bestseller: false,
    is_active: true,
    // Banner ad fields
    banner_ad_title: '',
    banner_ad_description: '',
    banner_ad_image_url: '',
    banner_ad_link_url: '',
    banner_ad_duration: '1_week' as '1_week' | '2_weeks' | '3_weeks' | '4_weeks' | '6_months',
    banner_ad_is_repeating: false,
    banner_ad_start_date: '',
    banner_ad_end_date: '',
    banner_ad_is_active: false
  });
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [bannerAdImagePreview, setBannerAdImagePreview] = useState<string | null>(null);
  const [selectedBannerAdImage, setSelectedBannerAdImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<File[]>([]);

  // Colour Variations State
  const [variations, setVariations] = useState<VariationForm[]>([]);

  const addVariation = () => {
    setVariations(prev => [...prev, {
      colour_name: '',
      colour_hex: '',
      main_image_url: '',
      gallery_images: [],
      main_image_file: null,
      gallery_files: [],
      saved: false,
      saving: false,
    }]);
  };

  const removeVariation = (index: number) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, updates: Partial<VariationForm>) => {
    setVariations(prev => prev.map((v, i) => i === index ? { ...v, ...updates } : v));
  };

  const handleVariationColourSelect = (index: number, colourName: string) => {
    const colour = PREDEFINED_COLOURS.find(c => c.name === colourName);
    updateVariation(index, {
      colour_name: colourName,
      colour_hex: colour?.hex || '',
    });
  };

  const handleVariationMainImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return; }
      updateVariation(index, { main_image_file: file, main_image_url: URL.createObjectURL(file) });
    }
  };

  const handleVariationGalleryImages = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });
    if (valid.length > 0) {
      const current = variations[index];
      updateVariation(index, {
        gallery_files: [...current.gallery_files, ...valid],
        gallery_images: [...current.gallery_images, ...valid.map(f => URL.createObjectURL(f))],
      });
    }
  };

  const removeVariationGalleryImage = (varIndex: number, imgIndex: number) => {
    const current = variations[varIndex];
    updateVariation(varIndex, {
      gallery_images: current.gallery_images.filter((_, i) => i !== imgIndex),
      gallery_files: current.gallery_files.filter((_, i) => i !== imgIndex),
    });
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    return null;
  };

  const saveVariation = async (index: number) => {
    const v = variations[index];
    if (!v.colour_name) { alert('Please select a colour'); return; }

    updateVariation(index, { saving: true });

    try {
      let mainUrl = v.main_image_url;
      // Upload main image if it's a file (blob URL)
      if (v.main_image_file) {
        const url = await uploadFile(v.main_image_file, 'yuumpy/products/variations');
        if (url) mainUrl = url;
      }

      // Upload gallery files
      const galleryUrls: string[] = [];
      for (const img of v.gallery_images) {
        if (!img.startsWith('blob:')) {
          galleryUrls.push(img); // already uploaded
        }
      }
      for (const file of v.gallery_files) {
        const url = await uploadFile(file, 'yuumpy/products/variations/gallery');
        if (url) galleryUrls.push(url);
      }

      updateVariation(index, {
        main_image_url: mainUrl,
        main_image_file: null,
        gallery_images: galleryUrls,
        gallery_files: [],
        saved: true,
        saving: false,
      });
    } catch (err) {
      console.error('Error saving variation:', err);
      alert('Failed to upload variation images');
      updateVariation(index, { saving: false });
    }
  };

  const saveAllVariationsToServer = useCallback(async (productSlug: string) => {
    if (variations.length === 0) return;

    const payload = variations.map(v => ({
      colour_name: v.colour_name,
      colour_hex: v.colour_hex,
      main_image_url: v.main_image_url && !v.main_image_url.startsWith('blob:') ? v.main_image_url : null,
      gallery_images: v.gallery_images.filter(img => !img.startsWith('blob:')),
    }));

    try {
      await fetch(`/api/products/${productSlug}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variations: payload }),
      });
    } catch (err) {
      console.error('Error saving variations to server:', err);
    }
  }, [variations]);

  const loadVariations = async (productSlug: string) => {
    try {
      const res = await fetch(`/api/products/${productSlug}/variations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVariations(data.map((v: { id?: number; colour_name: string; colour_hex?: string; main_image_url?: string; gallery_images?: string[] }) => ({
            id: v.id,
            colour_name: v.colour_name,
            colour_hex: v.colour_hex || '',
            main_image_url: v.main_image_url || '',
            gallery_images: Array.isArray(v.gallery_images) ? v.gallery_images : [],
            main_image_file: null,
            gallery_files: [],
            saved: true,
            saving: false,
          })));
        }
      }
    } catch {
      // Table may not exist yet
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?admin=true');
      if (response.ok) {
        const data = await response.json();
        console.log('Products API response:', data);
        // Handle both array format and {products: [], pagination: {}} format
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
        console.log('Products set to:', productsArray);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const allCategories = Array.isArray(data) ? data : [];
        // Store all categories for reference, but show only main categories in the dropdown
        window.allCategories = allCategories; // Store globally for reference
        const mainCategories = allCategories.filter(cat => cat.parent_id === null);
        setCategories(mainCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (mainCategoryId: string) => {
    if (!mainCategoryId) {
      setSubcategories([]);
      setLoadingSubcategories(false);
      return [];
    }

    setLoadingSubcategories(true);
    try {
      console.log('Fetching subcategories for category ID:', mainCategoryId);
      const response = await fetch(`/api/subcategories?category_id=${mainCategoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const subcategoriesData = await response.json();
      console.log('Fetched subcategories:', subcategoriesData.length, 'items');
      
      // Ensure we always set an array
      const subcategoriesArray = Array.isArray(subcategoriesData) ? subcategoriesData : [];
      setSubcategories(subcategoriesArray);
      setLoadingSubcategories(false);
      return subcategoriesArray;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
      setLoadingSubcategories(false);
      return [];
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced Validation - Prevent categorization issues
    if (!formData.main_category_id) {
      alert('Please select a main category');
      return;
    }

    // Validate that main_category_id is actually a main category (not a subcategory)
    const selectedMainCategory = categories.find(cat => cat.id.toString() === formData.main_category_id);
    if (!selectedMainCategory) {
      alert('Invalid main category selected. Please refresh the page and try again.');
      return;
    }

    if (selectedMainCategory.parent_id !== null) {
      alert(`Error: "${selectedMainCategory.name}" is a subcategory, not a main category. Please select a main category from the dropdown.`);
      return;
    }

    // Validate subcategory belongs to selected main category
    if (formData.subcategory_id) {
      const selectedSubcategory = subcategories.find(sub => sub.id.toString() === formData.subcategory_id);
      if (!selectedSubcategory) {
        alert('Invalid subcategory selected. Please refresh the subcategories and try again.');
        return;
      }

      if (selectedSubcategory.category_id.toString() !== formData.main_category_id) {
        alert(`Error: The selected subcategory "${selectedSubcategory.name}" does not belong to the main category "${selectedMainCategory.name}". Please select a valid subcategory.`);
        return;
      }
    }

    console.log('✅ Categorization validation passed:');
    console.log(`  Main Category: ${selectedMainCategory.name} (ID: ${selectedMainCategory.id})`);
    if (formData.subcategory_id) {
      const selectedSubcategory = subcategories.find(sub => sub.id.toString() === formData.subcategory_id);
      console.log(`  Subcategory: ${selectedSubcategory?.name} (ID: ${selectedSubcategory?.id})`);
    }
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.slug}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      let imageUrl = imagePreview || '';
      let bannerAdImageUrl = bannerAdImagePreview || '';
      let finalGalleryImages: string[] = [...galleryImages];
      const uploadedGalleryUrls: string[] = [];
      
      // Upload new product image if selected
      if (selectedImage) {
        setUploading(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedImage);
          uploadFormData.append('folder', 'yuumpy/products');
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
            console.log('Product image uploaded successfully:', imageUrl);
          } else {
            const errorResult = await uploadResponse.json().catch(() => ({ error: 'Unknown upload error' }));
            console.error('Upload API error:', errorResult);
            throw new Error(errorResult.error || errorResult.details || 'Failed to upload product image');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload product image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Upload new gallery images if selected
      if (selectedGalleryImages.length > 0) {
        setUploading(true);
        try {
          for (const file of selectedGalleryImages) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('folder', 'yuumpy/products/gallery');
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: uploadFormData
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              uploadedGalleryUrls.push(uploadResult.url);
              console.log('Gallery image uploaded successfully:', uploadResult.url);
            } else {
              const errorResult = await uploadResponse.json().catch(() => ({ error: 'Unknown upload error' }));
              console.error('Gallery upload API error:', errorResult);
              throw new Error(errorResult.error || errorResult.details || 'Failed to upload gallery image');
            }
          }
        } catch (uploadError) {
          console.error('Gallery upload error:', uploadError);
          alert(`Failed to upload gallery images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Combine existing gallery images with newly uploaded ones
      finalGalleryImages = [...galleryImages, ...uploadedGalleryUrls];

      // Upload new banner ad image if selected
      if (selectedBannerAdImage) {
        setUploading(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedBannerAdImage);
          uploadFormData.append('folder', 'yuumpy/banner-ads');
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            bannerAdImageUrl = uploadResult.url;
            console.log('Banner ad image uploaded successfully:', bannerAdImageUrl);
          } else {
            const errorResult = await uploadResponse.json().catch(() => ({ error: 'Unknown upload error' }));
            console.error('Banner ad upload API error:', errorResult);
            throw new Error(errorResult.error || errorResult.details || 'Failed to upload banner ad image');
          }
        } catch (uploadError) {
          console.error('Banner ad upload error:', uploadError);
          alert(`Failed to upload banner ad image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          return;
        } finally {
          setUploading(false);
        }
      }
      
      await submitProduct(url, method, imageUrl, bannerAdImageUrl, finalGalleryImages);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving the product');
    }
  };

  const submitProduct = async (url: string, method: string, imageUrl: string, bannerAdImageUrl: string, galleryUrls: string[]) => {
    try {
      console.log('Form data before processing:', formData);

      // Validate and clean the data
      const cleanPrice = formData.price ? parseFloat(formData.price) : 0;
      const cleanOriginalPrice = formData.original_price ? parseFloat(formData.original_price) : null;
      const cleanCategoryId = formData.main_category_id ? parseInt(formData.main_category_id) : null;
      const cleanSubcategoryId = formData.subcategory_id ? parseInt(formData.subcategory_id) : null;
      const cleanBrandId = formData.brand_id ? parseInt(formData.brand_id) : null;

      // Validation checks
      if (!formData.name?.trim()) {
        alert('Please enter a product name');
        return;
      }

      if (!formData.short_description?.trim()) {
        alert('Please enter a brief description');
        return;
      }

      if (formData.purchase_type === 'affiliate' && !formData.affiliate_url?.trim()) {
        alert('Please enter an affiliate URL for affiliate products');
        return;
      }

      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        alert('Please enter a valid price greater than 0');
        return;
      }

      if (!cleanCategoryId) {
        alert('Please select a main category');
        return;
      }

      // Validate URL format only for affiliate products
      if (formData.purchase_type === 'affiliate' && formData.affiliate_url?.trim()) {
        try {
          new URL(formData.affiliate_url);
        } catch {
          alert('Please enter a valid affiliate URL (must start with http:// or https://)');
          return;
        }
      }

      const productData = {
        name: formData.name?.trim() || '',
        short_description: formData.short_description?.trim() || '',
        long_description: formData.long_description?.trim() || '',
        product_review: formData.product_review?.trim() || '',
        description: formData.short_description?.trim() || '',
        price: cleanPrice,
        original_price: cleanOriginalPrice,
        affiliate_url: formData.affiliate_url?.trim() || '',
        affiliate_partner_name: formData.affiliate_partner_name?.trim() || '',
        external_purchase_info: formData.external_purchase_info?.trim() || '',
        purchase_type: formData.purchase_type || 'affiliate',
        product_condition: formData.product_condition || 'new',
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        colors: formData.colors || [],
        category_id: cleanCategoryId, // Always use main category ID
        subcategory_id: cleanSubcategoryId, // Use subcategory ID if selected
        brand_id: cleanBrandId,
        image_url: imageUrl?.trim() || null,
        gallery: galleryUrls.length > 0 ? JSON.stringify(galleryUrls) : null,
        is_featured: Boolean(formData.is_featured),
        is_bestseller: Boolean(formData.is_bestseller),
        is_active: Boolean(formData.is_active),
        // Banner ad fields
        banner_ad_title: formData.banner_ad_title?.trim() || null,
        banner_ad_description: formData.banner_ad_description?.trim() || null,
        banner_ad_image_url: bannerAdImageUrl?.trim() || null,
        banner_ad_link_url: formData.banner_ad_link_url?.trim() || null,
        banner_ad_duration: formData.banner_ad_duration || '1_week',
        banner_ad_is_repeating: Boolean(formData.banner_ad_is_repeating),
        banner_ad_start_date: formData.banner_ad_start_date || null,
        banner_ad_end_date: formData.banner_ad_end_date || null,
        banner_ad_is_active: Boolean(formData.banner_ad_is_active)
      };

      console.log('Cleaned product data:', productData);

      // Test JSON serialization
      let jsonString;
      try {
        jsonString = JSON.stringify(productData);
        console.log('JSON string:', jsonString);
      } catch (jsonError) {
        console.error('JSON serialization error:', jsonError);
        alert('Error preparing data for submission');
        return;
      }

      const attemptSave = async (): Promise<Response> => {
        return fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: jsonString
        });
      };

      let response = await attemptSave();
      let responseData: { error?: string; details?: string; success?: boolean } = {};
      try { responseData = await response.json(); } catch { responseData = {}; }
      console.log('API Response:', responseData);

      // If server errored (likely due to missing columns), try migrating and retry once
      if (!response.ok && response.status === 500) {
        try {
          console.warn('Save failed with 500. Attempting automatic migration...');
          const migrateRes = await fetch('/api/migrate-products', { method: 'POST' });
          const migrateData = await migrateRes.json().catch(() => ({}));
          console.log('Migration response:', migrateData);
        } catch (migrateErr) {
          console.error('Migration request failed:', migrateErr);
        }
        // Retry once
        response = await attemptSave();
        try { responseData = await response.json(); } catch { responseData = {}; }
        console.log('Retry API Response:', responseData);
      }

      if (response.ok) {
        // Save colour variations to server
        const savedProduct = responseData as { product?: { slug?: string }; success?: boolean; error?: string; details?: string };
        const productSlug = editingProduct?.slug || savedProduct?.product?.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await saveAllVariationsToServer(productSlug);

        alert('Product saved successfully!');
        fetchProducts();
        // Close form after successful update, but don't reset data
        if (editingProduct) {
          setShowForm(false);
          setEditingProduct(null);
        } else {
          // For new products, reset the entire form
          resetForm();
        }
      } else {
        const errorMessage = responseData?.error || 'Failed to save product';
        const errorDetails = responseData?.details || '';
        console.error('Save error:', responseData);
        console.error('Response status:', response.status);
        console.error('Full response:', response);
        
        if (errorDetails.includes('foreign key constraint')) {
          alert('Database constraint error: The selected category or subcategory may not exist. Please try selecting a different category or contact support.');
        } else {
          alert(`${errorMessage}${errorDetails ? '\n\nDetails: ' + errorDetails : ''}\n\nCheck console for more details.`);
        }
      }
    } catch (error) {
      console.error('Error in submitProduct:', error);
      alert('An error occurred while saving the product');
    }
  };

  // Helper function to safely format datetime values
  const formatDateTimeForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    
    // Find the product's category from all categories
    const allCategories = window.allCategories || [];
    let mainCategoryId = '';
    let categoryId = product.category_id?.toString() || '';
    
    console.log('Product data:', { 
      subcategory_id: product.subcategory_id, 
      category_id: product.category_id 
    });
    console.log('All categories:', allCategories);
    
    // If product has a subcategory_id, we need to fetch subcategories to find the parent
    if (product.subcategory_id) {
      // First, try to find the subcategory in allCategories (if it exists)
      const subcategory = allCategories.find((cat: Category) => cat.id === product.subcategory_id);
      console.log('Found subcategory in allCategories:', subcategory);
      
      if (subcategory && subcategory.parent_id) {
        // Found it in allCategories with parent_id
        mainCategoryId = subcategory.parent_id.toString();
        categoryId = subcategory.parent_id.toString();
        console.log('Setting main category from subcategory parent_id:', mainCategoryId);
        await fetchSubcategories(mainCategoryId);
      } else {
        // Not found in allCategories, need to fetch from subcategories API
        try {
          const response = await fetch('/api/subcategories');
          if (response.ok) {
            const subcategoriesData = await response.json();
            const subcategoryData = subcategoriesData.find((sub: Category) => sub.id === product.subcategory_id);
            console.log('Found subcategory in API:', subcategoryData);
            if (subcategoryData && subcategoryData.category_id) {
              mainCategoryId = subcategoryData.category_id.toString();
              categoryId = subcategoryData.category_id.toString();
              console.log('Setting main category from subcategory category_id:', mainCategoryId);
              await fetchSubcategories(mainCategoryId);
            }
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      }
    } else if (product.category_id) {
      // If no subcategory, check if category_id is a main category
      const productCategory = allCategories.find((cat: Category) => cat.id === product.category_id);
      console.log('Found product category:', productCategory);
      if (productCategory && !productCategory.parent_id) {
        // It's a main category
        mainCategoryId = product.category_id.toString();
        console.log('Setting main category directly:', mainCategoryId);
      }
    }
    
    console.log('Final values:', { mainCategoryId, categoryId });
    
    // Parse gallery from JSON string if it exists
    let parsedGallery: string[] = [];
    if (product.gallery) {
      try {
        parsedGallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
      } catch (e) {
        console.error('Failed to parse gallery:', e);
        parsedGallery = [];
      }
    }

    // Parse colors
    let parsedColors: ColorOption[] = [];
    if (product.colors) {
      try {
        const parsed = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
        if (Array.isArray(parsed)) {
          parsedColors = parsed.map(c => typeof c === 'string' ? { name: c } : c);
        }
      } catch (e) {
        console.error('Failed to parse colors:', e);
        parsedColors = [];
      }
    }

    setFormData({
      name: product.name,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      short_description: product.short_description,
      long_description: product.long_description || '',
      product_review: product.product_review || '',
      affiliate_url: product.affiliate_url,
      affiliate_partner_name: product.affiliate_partner_name || '',
      external_purchase_info: product.external_purchase_info || '',
      purchase_type: product.purchase_type || 'affiliate',
      product_condition: product.product_condition || 'new',
      stock_quantity: product.stock_quantity?.toString() || '',
      main_category_id: mainCategoryId,
      category_id: categoryId,
      subcategory_id: product.subcategory_id?.toString() || '',
      brand_id: product.brand_id?.toString() || '',
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_active: product.is_active,
      // Banner ad fields
      banner_ad_title: product.banner_ad_title || '',
      banner_ad_description: product.banner_ad_description || '',
      banner_ad_image_url: product.banner_ad_image_url || '',
      banner_ad_link_url: product.banner_ad_link_url || '',
      banner_ad_duration: product.banner_ad_duration || '1_week',
      banner_ad_is_repeating: product.banner_ad_is_repeating || false,
      banner_ad_start_date: formatDateTimeForInput(product.banner_ad_start_date),
      banner_ad_end_date: formatDateTimeForInput(product.banner_ad_end_date),
      banner_ad_is_active: product.banner_ad_is_active || false,
      colors: parsedColors
    });
    setImagePreview(product.image_url);
    setSelectedImage(null);
    setBannerAdImagePreview(product.banner_ad_image_url || null);
    setSelectedBannerAdImage(null);
    
    setGalleryImages(parsedGallery);
    setSelectedGalleryImages([]);
    setShowForm(true);

    // Load colour variations from server
    setVariations([]);
    loadVariations(product.slug);
  };

  const handleDelete = async (product: Product) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/products/${product.slug}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts(); // Refresh the product list
        } else {
          alert(`Failed to delete product: ${data.error || 'Unknown error'}`);
          console.error('Delete error:', data);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting the product. Please try again.');
      }
    }
  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerAdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedBannerAdImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerAdImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedGalleryImages(prev => [...prev, ...validFiles]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedGalleryImage = (index: number) => {
    setSelectedGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      original_price: '',
      short_description: '',
      long_description: '',
      product_review: '',
      affiliate_url: '',
      affiliate_partner_name: '',
      external_purchase_info: '',
      purchase_type: 'affiliate',
      product_condition: 'new',
      colors: [],
      stock_quantity: '',
      main_category_id: '',
      category_id: '',
      subcategory_id: '',
      brand_id: '',
      is_featured: false,
      is_bestseller: false,
      is_active: true,
      // Banner ad fields
      banner_ad_title: '',
      banner_ad_description: '',
      banner_ad_image_url: '',
      banner_ad_link_url: '',
      banner_ad_duration: '1_week',
      banner_ad_is_repeating: false,
      banner_ad_start_date: '',
      banner_ad_end_date: '',
      banner_ad_is_active: false
    });
    setSubcategories([]);
    setLoadingSubcategories(false);
    setImagePreview(null);
    setSelectedImage(null);
    setBannerAdImagePreview(null);
    setSelectedBannerAdImage(null);
    setGalleryImages([]);
    setSelectedGalleryImages([]);
    setEditingProduct(null);
    setShowForm(false);
    setVariations([]);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];



  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your affiliate products</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer hover:bg-purple-700"
            style={{ backgroundColor: '#8827ee' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {!loading && (
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} products
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        {product.image_url && product.image_url.trim() ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.short_description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.category_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        £{Number(product.price).toFixed(2)}
                      </div>
                      {product.original_price && (
                        <div className="text-sm text-gray-500 line-through">
                          £{Number(product.original_price).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                        {product.is_bestseller && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center">
                          💳 Purchase Type *
                          <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Important</span>
                        </span>
                      </label>
                      <select
                        required
                        value={formData.purchase_type}
                        onChange={(e) => setFormData({...formData, purchase_type: e.target.value as 'affiliate' | 'direct'})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="affiliate">Affiliate (Redirect to partner)</option>
                        <option value="direct">Direct Sale (Buy on Yuumpy)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.purchase_type === 'affiliate' 
                          ? 'Customer will be redirected to affiliate partner to complete purchase'
                          : 'Customer will checkout and pay directly on Yuumpy with Stripe'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Condition *
                      </label>
                      <select
                        required
                        value={formData.product_condition}
                        onChange={(e) => setFormData({...formData, product_condition: e.target.value as 'new' | 'refurbished' | 'used'})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="refurbished">Refurbished</option>
                        <option value="used">Used</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.product_condition === 'new' 
                          ? 'Brand new, unused product in original packaging'
                          : formData.product_condition === 'refurbished'
                          ? 'Professionally restored to working condition with warranty'
                          : 'Previously owned, may show signs of use'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center">
                          📁 Main Category *
                          <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Primary</span>
                        </span>
                      </label>
                      <select
                        required
                        value={formData.main_category_id}
                        onChange={async (e) => {
                          const mainCategoryId = e.target.value;
                          setFormData({
                            ...formData, 
                            main_category_id: mainCategoryId,
                            category_id: mainCategoryId, // Default to main category
                            subcategory_id: '' // Clear subcategory when main category changes
                          });
                          // Clear subcategories immediately
                          setSubcategories([]);
                          // Fetch subcategories if category is selected
                          if (mainCategoryId) {
                            await fetchSubcategories(mainCategoryId);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Main Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center">
                          📁 Subcategory (Optional)
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Secondary</span>
                        </span>
                      </label>
                      <select
                        value={formData.subcategory_id}
                        onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!formData.main_category_id || loadingSubcategories}
                      >
                        <option value="">No Subcategory selected</option>
                        {loadingSubcategories ? (
                          <option value="" disabled>Loading subcategories...</option>
                        ) : (
                          subcategories.map(subcategory => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))
                        )}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {loadingSubcategories 
                          ? 'Loading subcategories...'
                          : subcategories.length > 0 
                            ? `${subcategories.length} subcategories available` 
                            : formData.main_category_id
                              ? 'No subcategories found for this category'
                              : 'Select a category first'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand (Optional)
                      </label>
                      <select
                        value={formData.brand_id}
                        onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">No Brand Selected</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Associate product with a brand
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (£) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.short_description}
                        onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief one-liner about the product (displays at top of product page)"
                      />
                      <p className="text-xs text-gray-500 mt-1">This appears near the product image and buy button</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Long Description
                      </label>
                      <textarea
                        rows={6}
                        value={formData.long_description}
                        onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Detailed product description with features, specifications, benefits, use cases, etc."
                      />
                      <p className="text-xs text-gray-500 mt-1">Comprehensive product information for customers</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Review / Expert Insight
                      </label>
                      <textarea
                        rows={5}
                        value={formData.product_review}
                        onChange={(e) => setFormData({...formData, product_review: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Editorial review, expert opinion, pros/cons, recommendations to help customers make informed decisions"
                      />
                      <p className="text-xs text-gray-500 mt-1">Provides additional insights and recommendations</p>
                    </div>

                    {/* Affiliate Product Fields */}
                    {formData.purchase_type === 'affiliate' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Affiliate URL *
                          </label>
                          <input
                            type="url"
                            required={formData.purchase_type === 'affiliate'}
                            value={formData.affiliate_url}
                            onChange={(e) => setFormData({...formData, affiliate_url: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/affiliate-link"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Affiliate Partner Name
                          </label>
                          <input
                            type="text"
                            value={formData.affiliate_partner_name}
                            onChange={(e) => setFormData({...formData, affiliate_partner_name: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Amazon, Best Buy, Target, etc."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            External Purchase Information
                          </label>
                          <textarea
                            rows={3}
                            value={formData.external_purchase_info}
                            onChange={(e) => setFormData({...formData, external_purchase_info: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., You will be redirected to Amazon to complete your purchase securely"
                          />
                        </div>

                        {/* Affiliate Information Section */}
                        <div className="md:col-span-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">Affiliate Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <p className="text-sm text-blue-800">
                                  <strong>Affiliate Partner:</strong> {'This product is sold by our trusted affiliate partner. Customers will be redirected to complete their purchase on the partner\'s website.'}
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <p className="text-sm text-blue-800">
                                  <strong>External Purchase:</strong> {'When customers click "Buy Now", they will be redirected to the affiliate\'s website to complete their purchase securely.'}
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <p className="text-sm text-blue-800">
                                  <strong>Customer Notice:</strong> {"This information will be displayed to customers so they understand they're being redirected to an external site."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Direct Sale Product Fields */}
                    {formData.purchase_type === 'direct' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stock_quantity}
                            onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Leave empty for unlimited stock"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Optional: Set stock quantity. Leave empty for unlimited stock.
                          </p>
                        </div>

                        {/* Direct Sale Information Section */}
                        <div className="md:col-span-2">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-900 mb-3">Direct Sale Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <p className="text-sm text-green-800">
                                  <strong>Direct Purchase:</strong> Customers will checkout and pay directly on Yuumpy using Stripe.
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <p className="text-sm text-green-800">
                                  <strong>Order Management:</strong> Orders will appear in your admin dashboard for fulfillment.
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <p className="text-sm text-green-800">
                                  <strong>Customer Tracking:</strong> Customers can create accounts to track their orders.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="space-y-4">
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative">
                            <Image
                              src={imagePreview}
                              alt="Product preview"
                              width={128}
                              height={128}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                              unoptimized={true}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setSelectedImage(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        
                        {/* File Upload */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload a product image (JPG, PNG, GIF, max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Images (for thumbnail gallery)
                      </label>
                      <div className="space-y-4">
                        {/* Existing Gallery Images */}
                        {galleryImages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {galleryImages.map((img, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={img}
                                  alt={`Gallery ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                  unoptimized={true}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New Gallery Images Preview */}
                        {selectedGalleryImages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedGalleryImages.map((file, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt={`New ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded-lg border border-green-300"
                                  unoptimized={true}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSelectedGalleryImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* File Upload */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryImagesChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload multiple gallery images (JPG, PNG, GIF, max 5MB each). These will appear as thumbnails.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colour Variations Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">🎨 Colour Variations</h3>
                      <span className="text-xs text-gray-500">{variations.length} variation{variations.length !== 1 ? 's' : ''}</span>
                    </div>

                    {variations.length === 0 && (
                      <p className="text-sm text-gray-500 italic mb-4">No colour variations added yet. Add variations so customers can choose different colours.</p>
                    )}

                    <div className="space-y-4">
                      {variations.map((variation, vIndex) => (
                        <div key={vIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                          <button
                            type="button"
                            onClick={() => removeVariation(vIndex)}
                            className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Remove variation"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upload Main Image */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Upload className="w-4 h-4 inline mr-1" />
                                Upload Main Image
                              </label>
                              <div className="flex items-center gap-3">
                                {variation.main_image_url && (
                                  <Image
                                    src={variation.main_image_url}
                                    alt={`${variation.colour_name || 'Variation'} main`}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                    unoptimized={true}
                                  />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleVariationMainImage(vIndex, e)}
                                  className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Select Colour */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <ChevronDown className="w-4 h-4 inline mr-1" />
                                Select Colour
                              </label>
                              <div className="flex items-center gap-2">
                                {variation.colour_hex && (
                                  <span
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: variation.colour_hex }}
                                  />
                                )}
                                <select
                                  value={variation.colour_name}
                                  onChange={(e) => handleVariationColourSelect(vIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                                >
                                  <option value="">-- Select a colour --</option>
                                  {PREDEFINED_COLOURS.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Upload Thumbnail Images */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Thumbnail Images
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleVariationGalleryImages(vIndex, e)}
                                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                              />
                              {variation.gallery_images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {variation.gallery_images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative">
                                      <Image
                                        src={img}
                                        alt={`Thumb ${imgIdx + 1}`}
                                        width={60}
                                        height={60}
                                        className="w-14 h-14 object-cover rounded border border-gray-300"
                                        unoptimized={true}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeVariationGalleryImage(vIndex, imgIdx)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Save Variation Button */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {variation.saved && (
                                <span className="text-xs text-green-600 font-medium">✓ Images uploaded</span>
                              )}
                              {variation.colour_name && (
                                <span className="text-xs text-gray-500">
                                  {variation.colour_name}
                                  {variation.main_image_url ? ' • Main image set' : ''}
                                  {variation.gallery_images.length > 0 ? ` • ${variation.gallery_images.length} thumbnail${variation.gallery_images.length > 1 ? 's' : ''}` : ''}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => saveVariation(vIndex)}
                              disabled={variation.saving || !variation.colour_name}
                              className="px-4 py-1.5 text-sm text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 cursor-pointer flex items-center gap-1"
                              style={{ backgroundColor: variation.saving ? undefined : '#8827ee' }}
                            >
                              {variation.saving && (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              )}
                              {variation.saving ? 'Uploading...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addVariation}
                      className="mt-4 w-full py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add more colour variation
                    </button>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_bestseller}
                        onChange={(e) => setFormData({...formData, is_bestseller: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Bestseller</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  {/* Banner Ad Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Advertisement</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner Ad Title
                        </label>
                        <input
                          type="text"
                          value={formData.banner_ad_title || ''}
                          onChange={(e) => setFormData({...formData, banner_ad_title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter banner ad title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner Ad Link URL
                        </label>
                        <input
                          type="url"
                          value={formData.banner_ad_link_url || ''}
                          onChange={(e) => setFormData({...formData, banner_ad_link_url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner Ad Description
                      </label>
                      <textarea
                        value={formData.banner_ad_description || ''}
                        onChange={(e) => setFormData({...formData, banner_ad_description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter banner ad description"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner Ad Image
                      </label>
                      <div className="space-y-4">
                        {bannerAdImagePreview && (
                          <div className="relative">
                            <Image
                              src={bannerAdImagePreview}
                              alt="Banner ad preview"
                              width={600}
                              height={128}
                              className="w-full h-32 object-cover rounded-lg border"
                              unoptimized={true}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerAdImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500">
                          Upload a banner ad image (JPG, PNG, GIF, max 5MB)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <select
                          value={formData.banner_ad_duration || '1_week'}
                          onChange={(e) => setFormData({...formData, banner_ad_duration: e.target.value as '1_week' | '2_weeks' | '3_weeks' | '4_weeks' | '6_months'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1_week">1 Week</option>
                          <option value="2_weeks">2 Weeks</option>
                          <option value="3_weeks">3 Weeks</option>
                          <option value="4_weeks">4 Weeks</option>
                          <option value="6_months">6 Months</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.banner_ad_start_date || ''}
                          onChange={(e) => setFormData({...formData, banner_ad_start_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.banner_ad_end_date || ''}
                          onChange={(e) => setFormData({...formData, banner_ad_end_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.banner_ad_is_repeating}
                          onChange={(e) => setFormData({...formData, banner_ad_is_repeating: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Repeat Ad</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.banner_ad_is_active}
                          onChange={(e) => setFormData({...formData, banner_ad_is_active: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 hover:bg-purple-700 cursor-pointer"
                      style={{ backgroundColor: '#8827ee' }}
                    >
                      {uploading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>
                        {uploading 
                          ? 'Uploading...' 
                          : editingProduct 
                            ? 'Update Product' 
                            : 'Add Product'
                        }
                      </span>
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
