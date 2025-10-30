async function testSamsungFilters() {
  try {
    console.log('Testing Samsung Galaxy S25 with specific filters...\n');

    // Get current Samsung product details
    console.log('1. Current Samsung Galaxy S25 product details:');
    const productResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    if (productResponse.ok) {
      const productData = await productResponse.json();
      const products = productData.products || productData;
      const samsung = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      if (samsung) {
        console.log({
          name: samsung.name,
          category_id: samsung.category_id,
          category_name: samsung.category_name,
          category_slug: samsung.category_slug,
          subcategory_id: samsung.subcategory_id,
          subcategory_name: samsung.subcategory_name,
          subcategory_slug: samsung.subcategory_slug,
          brand_id: samsung.brand_id,
          brand_name: samsung.brand_name,
          brand_slug: samsung.brand_slug,
          is_active: samsung.is_active,
          is_featured: samsung.is_featured,
          price: samsung.price
        });
      }
    }

    // Test 2: Electronics category filter
    console.log('\n2. Testing Electronics category filter:');
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsResponse.ok) {
      const electronicsData = await electronicsResponse.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungElectronics.length} Samsung products in electronics category`);
      samsungElectronics.forEach(p => console.log(`- ${p.name}`));
    }

    // Test 3: Smartphones subcategory filter
    console.log('\n3. Testing Smartphones subcategory filter:');
    const smartphonesResponse = await fetch('http://localhost:3000/api/products?subcategory=smartphones');
    if (smartphonesResponse.ok) {
      const smartphonesData = await smartphonesResponse.json();
      const smartphonesProducts = smartphonesData.products || smartphonesData;
      const samsungSmartphones = smartphonesProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungSmartphones.length} Samsung products in smartphones subcategory`);
      samsungSmartphones.forEach(p => console.log(`- ${p.name}`));
    }

    // Test 4: Samsung brand filter
    console.log('\n4. Testing Samsung brand filter:');
    const samsungBrandResponse = await fetch('http://localhost:3000/api/products?brand=samsung');
    if (samsungBrandResponse.ok) {
      const samsungBrandData = await samsungBrandResponse.json();
      const samsungBrandProducts = samsungBrandData.products || samsungBrandData;
      const samsungProducts = samsungBrandProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungProducts.length} Samsung products with Samsung brand filter`);
      samsungProducts.forEach(p => console.log(`- ${p.name}`));
    }

    // Test 5: Combined filters
    console.log('\n5. Testing combined filters (electronics + smartphones + samsung):');
    const combinedResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones&brand=samsung');
    if (combinedResponse.ok) {
      const combinedData = await combinedResponse.json();
      const combinedProducts = combinedData.products || combinedData;
      console.log(`Found ${combinedProducts.length} products with combined filters`);
      combinedProducts.forEach(p => console.log(`- ${p.name} (Category: ${p.category_name}, Subcategory: ${p.subcategory_name}, Brand: ${p.brand_name})`));
    }

    // Test 6: Check subcategories
    console.log('\n6. Available subcategories:');
    const subcategoriesResponse = await fetch('http://localhost:3000/api/categories');
    if (subcategoriesResponse.ok) {
      const subcategories = await subcategoriesResponse.json();
      const smartphoneSubcats = subcategories.filter(c => c.name.toLowerCase().includes('smartphone') || c.slug.includes('smartphone'));
      console.log('Smartphone-related subcategories:');
      smartphoneSubcats.forEach(c => console.log(`- ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`));
    }

  } catch (error) {
    console.error('Error testing Samsung filters:', error);
  }
}

testSamsungFilters();