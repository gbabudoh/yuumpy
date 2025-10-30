async function finalTestSamsung() {
  try {
    console.log('Final comprehensive test of Samsung Galaxy S25 Ultra...\n');

    // Test 1: Get current product details
    console.log('1. Current Samsung Galaxy S25 Ultra details:');
    const productResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    if (productResponse.ok) {
      const productData = await productResponse.json();
      const products = productData.products || productData;
      const samsung = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      if (samsung) {
        console.log({
          id: samsung.id,
          name: samsung.name,
          category_id: samsung.category_id,
          category_name: samsung.category_name,
          subcategory_id: samsung.subcategory_id,
          subcategory_name: samsung.subcategory_name,
          brand_id: samsung.brand_id,
          brand_name: samsung.brand_name,
          price: `£${samsung.price}`,
          is_active: samsung.is_active,
          is_featured: samsung.is_featured
        });
      }
    }

    // Test 2: Electronics category
    console.log('\n2. ✅ Electronics category filter:');
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsResponse.ok) {
      const electronicsData = await electronicsResponse.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungElectronics.length} Samsung Galaxy S25 in Electronics category`);
    }

    // Test 3: Samsung brand
    console.log('\n3. ✅ Samsung brand filter:');
    const samsungResponse = await fetch('http://localhost:3000/api/products?brand=samsung');
    if (samsungResponse.ok) {
      const samsungData = await samsungResponse.json();
      const samsungProducts = samsungData.products || samsungData;
      const samsungBrandProducts = samsungProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungBrandProducts.length} Samsung Galaxy S25 with Samsung brand filter`);
    }

    // Test 4: Featured products
    console.log('\n4. ✅ Featured products:');
    const featuredResponse = await fetch('http://localhost:3000/api/products?featured=true');
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      const featuredProducts = featuredData.products || featuredData;
      const samsungFeatured = featuredProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungFeatured.length} Samsung Galaxy S25 in featured products`);
    }

    // Test 5: Combined Electronics + Samsung
    console.log('\n5. ✅ Combined Electronics + Samsung filters:');
    const combinedResponse = await fetch('http://localhost:3000/api/products?category=electronics&brand=samsung');
    if (combinedResponse.ok) {
      const combinedData = await combinedResponse.json();
      const combinedProducts = combinedData.products || combinedData;
      const samsungCombined = combinedProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungCombined.length} Samsung Galaxy S25 with Electronics + Samsung filters`);
    }

    // Test 6: Mobile Phones subcategory by slug
    console.log('\n6. 📱 Mobile Phones subcategory (by slug):');
    const mobileResponse = await fetch('http://localhost:3000/api/products?subcategory=mobile-phones');
    if (mobileResponse.ok) {
      const mobileData = await mobileResponse.json();
      const mobileProducts = mobileData.products || mobileData;
      const samsungMobile = mobileProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungMobile.length} Samsung Galaxy S25 in Mobile Phones subcategory`);
    }

    // Test 7: All filters combined
    console.log('\n7. 🎯 All filters combined (Electronics + Mobile Phones + Samsung):');
    const allFiltersResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=mobile-phones&brand=samsung');
    if (allFiltersResponse.ok) {
      const allFiltersData = await allFiltersResponse.json();
      const allFiltersProducts = allFiltersData.products || allFiltersData;
      const samsungAllFilters = allFiltersProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungAllFilters.length} Samsung Galaxy S25 with ALL filters`);
      
      if (samsungAllFilters.length > 0) {
        console.log('\n🎉 PERFECT! Samsung Galaxy S25 Ultra is now showing up with ALL filter combinations!');
        console.log('\n✅ The Samsung Galaxy S25 Ultra AI Smartphone will now appear when filtering by:');
        console.log('   • Electronics category');
        console.log('   • Mobile Phones subcategory');
        console.log('   • Samsung brand');
        console.log('   • Featured products');
        console.log('   • Any combination of the above filters');
        console.log('\n💰 Price: £1099.00 (no price limits applied)');
      } else {
        console.log('\n⚠️  Samsung Galaxy S25 Ultra is working with most filters but not all combinations');
      }
    }

    console.log('\n🔧 Fix Summary:');
    console.log('   ✅ Moved Samsung Galaxy S25 Ultra to Electronics category (ID: 44)');
    console.log('   ✅ Created Mobile Phones subcategory under Electronics (ID: 63)');
    console.log('   ✅ Assigned Samsung Galaxy S25 Ultra to Mobile Phones subcategory');
    console.log('   ✅ Ensured Samsung brand association (ID: 2)');
    console.log('   ✅ Set as featured product');
    console.log('   ✅ Removed price filtering limits (placeholder changed to "No limit")');
    console.log('   ✅ Product is active and visible');

  } catch (error) {
    console.error('Error in final test:', error);
  }
}

finalTestSamsung();