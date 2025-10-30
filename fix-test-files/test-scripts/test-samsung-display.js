async function testSamsungDisplay() {
  try {
    console.log('Testing Samsung Galaxy S25 display...\n');

    // Test 1: Get all products without filters
    console.log('1. Fetching all products...');
    const allProductsResponse = await fetch('http://localhost:3000/api/products?limit=50');
    if (allProductsResponse.ok) {
      const allData = await allProductsResponse.json();
      const allProducts = allData.products || allData;
      const samsungProducts = allProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungProducts.length} Samsung products in all products:`);
      samsungProducts.forEach(p => console.log(`- ${p.name} (£${p.price}) - Active: ${p.is_active}, Featured: ${p.is_featured}`));
    }

    // Test 2: Get featured products
    console.log('\n2. Fetching featured products...');
    const featuredResponse = await fetch('http://localhost:3000/api/products?featured=true');
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      const featuredProducts = featuredData.products || featuredData;
      const samsungFeatured = featuredProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungFeatured.length} Samsung products in featured products:`);
      samsungFeatured.forEach(p => console.log(`- ${p.name} (£${p.price})`));
    }

    // Test 3: Get products by electronics category
    console.log('\n3. Fetching electronics category products...');
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsResponse.ok) {
      const electronicsData = await electronicsResponse.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungElectronics.length} Samsung products in electronics category:`);
      samsungElectronics.forEach(p => console.log(`- ${p.name} (£${p.price})`));
    }

    // Test 4: Search for Samsung specifically
    console.log('\n4. Searching for Samsung products...');
    const searchResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const searchProducts = searchData.products || searchData;
      console.log(`Found ${searchProducts.length} products in Samsung Galaxy S25 search:`);
      searchProducts.forEach(p => console.log(`- ${p.name} (£${p.price})`));
    }

    // Test 5: Test with high price range
    console.log('\n5. Testing with high price range (£0-£2000)...');
    const priceRangeResponse = await fetch('http://localhost:3000/api/products?min_price=0&max_price=2000');
    if (priceRangeResponse.ok) {
      const priceData = await priceRangeResponse.json();
      const priceProducts = priceData.products || priceData;
      const samsungPrice = priceProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungPrice.length} Samsung products in £0-£2000 range:`);
      samsungPrice.forEach(p => console.log(`- ${p.name} (£${p.price})`));
    }

  } catch (error) {
    console.error('Error testing Samsung display:', error);
  }
}

testSamsungDisplay();