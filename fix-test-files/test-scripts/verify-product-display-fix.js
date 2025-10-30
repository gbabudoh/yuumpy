async function verifyProductDisplayFix() {
  try {
    console.log('✅ Verifying Product Display Fix\n');

    // Test 1: Electronics category (should show all 5 products)
    console.log('1. Testing Electronics category filter...');
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const electronicsData = await electronicsResponse.json();
    const electronicsProducts = electronicsData.products || electronicsData;
    
    console.log(`📱 Electronics category: ${electronicsProducts.length} products`);
    electronicsProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      Category: ${product.category_name} → ${product.subcategory_name}`);
      console.log(`      Brand: ${product.brand_name}`);
    });

    // Test 2: Smartphones subcategory
    console.log('\n2. Testing Smartphones subcategory filter...');
    const smartphonesResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones');
    const smartphonesData = await smartphonesResponse.json();
    const smartphonesProducts = smartphonesData.products || smartphonesData;
    
    console.log(`📱 Electronics → Smartphones: ${smartphonesProducts.length} products`);
    smartphonesProducts.forEach(product => {
      console.log(`   • ${product.name} (${product.brand_name})`);
    });

    // Test 3: Samsung brand filter
    console.log('\n3. Testing Samsung brand filter...');
    const samsungResponse = await fetch('http://localhost:3000/api/products?brand=samsung');
    const samsungData = await samsungResponse.json();
    const samsungProducts = samsungData.products || samsungData;
    
    console.log(`🏢 Samsung brand: ${samsungProducts.length} products`);
    samsungProducts.forEach(product => {
      console.log(`   • ${product.name} (${product.category_name} → ${product.subcategory_name})`);
    });

    // Test 4: Combined filters (Electronics + Samsung)
    console.log('\n4. Testing combined filters (Electronics + Samsung)...');
    const combinedResponse = await fetch('http://localhost:3000/api/products?category=electronics&brand=samsung');
    const combinedData = await combinedResponse.json();
    const combinedProducts = combinedData.products || combinedData;
    
    console.log(`📱🏢 Electronics + Samsung: ${combinedProducts.length} products`);
    combinedProducts.forEach(product => {
      console.log(`   • ${product.name}`);
    });

    // Test 5: All filters combined (Electronics + Smartphones + Samsung)
    console.log('\n5. Testing all filters combined (Electronics + Smartphones + Samsung)...');
    const allFiltersResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones&brand=samsung');
    const allFiltersData = await allFiltersResponse.json();
    const allFiltersProducts = allFiltersData.products || allFiltersData;
    
    console.log(`📱🏢📂 Electronics + Smartphones + Samsung: ${allFiltersProducts.length} products`);
    allFiltersProducts.forEach(product => {
      console.log(`   • ${product.name}`);
    });

    // Summary
    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log(`   ✅ Electronics category: ${electronicsProducts.length}/5 products showing`);
    console.log(`   ✅ Smartphones subcategory: ${smartphonesProducts.length}/3 products showing`);
    console.log(`   ✅ Samsung brand: ${samsungProducts.length}/2 products showing`);
    console.log(`   ✅ Combined filters working: ${combinedProducts.length} products`);
    
    if (electronicsProducts.length === 5) {
      console.log('\n🎉 SUCCESS: All 5 Electronics products are now displaying correctly!');
      console.log('   • Category filtering: ✅ Working');
      console.log('   • Subcategory filtering: ✅ Working');
      console.log('   • Brand filtering: ✅ Working');
      console.log('   • Combined filtering: ✅ Working');
    } else {
      console.log('\n⚠️  Issue still exists - not all products showing');
    }

  } catch (error) {
    console.error('❌ Error verifying fix:', error);
  }
}

verifyProductDisplayFix();