async function checkCategoriesAndBrands() {
  try {
    // Check categories
    console.log('Fetching categories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('Categories:', categories);
    } else {
      console.error('Failed to fetch categories');
    }

    // Check brands
    console.log('\nFetching brands...');
    const brandsResponse = await fetch('http://localhost:3000/api/brands');
    if (brandsResponse.ok) {
      const brands = await brandsResponse.json();
      console.log('Brands:', brands);
    } else {
      console.error('Failed to fetch brands');
    }

    // Check existing products to see the structure
    console.log('\nFetching existing products...');
    const productsResponse = await fetch('http://localhost:3000/api/products?limit=2');
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      console.log('Sample products:', data.products || data);
    } else {
      console.error('Failed to fetch products');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategoriesAndBrands();