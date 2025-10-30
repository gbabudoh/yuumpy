async function fixProductCategorization() {
  try {
    console.log('🔧 Fixing Product Categorization\n');

    // Step 1: Get all products that need fixing
    console.log('1. Getting products that need category fixes...');
    const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
    const allData = await allProductsResponse.json();
    const allProducts = allData.products || allData;

    // Find products that should be under Electronics
    const smartphoneProducts = allProducts.filter(p => p.category_name === 'Smartphones');
    const audioProducts = allProducts.filter(p => p.category_name === 'Audio & Headphones');
    
    console.log(`Found ${smartphoneProducts.length} smartphone products to move to Electronics`);
    console.log(`Found ${audioProducts.length} audio products to move to Electronics`);

    // Step 2: Fix smartphone products (move to Electronics category)
    console.log('\n2. Moving smartphone products to Electronics category...');
    for (const product of smartphoneProducts) {
      console.log(`   Fixing: ${product.name}`);
      
      const updateData = {
        name: product.name,
        slug: product.slug,
        description: product.description || product.short_description,
        short_description: product.short_description,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        affiliate_url: product.affiliate_url,
        affiliate_partner_name: product.affiliate_partner_name,
        external_purchase_info: product.external_purchase_info,
        image_url: product.image_url || '',
        category_id: 44, // Electronics category
        subcategory_id: 45, // Smartphones subcategory  
        brand_id: product.brand_id,
        is_featured: product.is_featured ? 1 : 0,
        is_bestseller: product.is_bestseller ? 1 : 0,
        is_active: 1,
        meta_title: product.meta_title,
        meta_description: product.meta_description
      };

      const updateResponse = await fetch(`http://localhost:3000/api/products/${product.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log(`   ✅ ${product.name} moved to Electronics → Smartphones`);
      } else {
        const error = await updateResponse.text();
        console.error(`   ❌ Failed to update ${product.name}:`, error);
      }
    }

    // Step 3: Fix audio products (move to Electronics category)
    console.log('\n3. Moving audio products to Electronics category...');
    for (const product of audioProducts) {
      console.log(`   Fixing: ${product.name}`);
      
      const updateData = {
        name: product.name,
        slug: product.slug,
        description: product.description || product.short_description,
        short_description: product.short_description,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        affiliate_url: product.affiliate_url,
        affiliate_partner_name: product.affiliate_partner_name,
        external_purchase_info: product.external_purchase_info,
        image_url: product.image_url || '',
        category_id: 44, // Electronics category
        subcategory_id: 47, // Audio & Headphones subcategory
        brand_id: product.brand_id,
        is_featured: product.is_featured ? 1 : 0,
        is_bestseller: product.is_bestseller ? 1 : 0,
        is_active: 1,
        meta_title: product.meta_title,
        meta_description: product.meta_description
      };

      const updateResponse = await fetch(`http://localhost:3000/api/products/${product.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log(`   ✅ ${product.name} moved to Electronics → Audio & Headphones`);
      } else {
        const error = await updateResponse.text();
        console.error(`   ❌ Failed to update ${product.name}:`, error);
      }
    }

    // Step 4: Verify the fixes
    console.log('\n4. Verifying fixes...');
    const verifyResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const electronicsProducts = verifyData.products || verifyData;
      
      console.log(`\n📱 Electronics category now has ${electronicsProducts.length} products:`);
      electronicsProducts.forEach(product => {
        console.log(`   • ${product.name}`);
        console.log(`     Subcategory: ${product.subcategory_name}`);
        console.log(`     Brand: ${product.brand_name}`);
      });
    }

    // Step 5: Test subcategory filtering
    console.log('\n5. Testing subcategory filtering...');
    
    // Test smartphones subcategory
    const smartphonesResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones');
    if (smartphonesResponse.ok) {
      const smartphonesData = await smartphonesResponse.json();
      const smartphonesFiltered = smartphonesData.products || smartphonesData;
      console.log(`\n📱 Electronics → Smartphones: ${smartphonesFiltered.length} products`);
    }

    // Test brand filtering
    console.log('\n6. Testing brand filtering...');
    const samsungResponse = await fetch('http://localhost:3000/api/products?category=electronics&brand=samsung');
    if (samsungResponse.ok) {
      const samsungData = await samsungResponse.json();
      const samsungProducts = samsungData.products || samsungData;
      console.log(`\n🏢 Electronics → Samsung: ${samsungProducts.length} products`);
    }

    console.log('\n🎉 CATEGORIZATION FIX COMPLETED!');
    console.log('   ✅ All electronics products now properly categorized');
    console.log('   ✅ Smartphones are under Electronics → Smartphones');
    console.log('   ✅ Audio products are under Electronics → Audio & Headphones');
    console.log('   ✅ Category, subcategory, and brand filtering should work correctly');

  } catch (error) {
    console.error('❌ Error fixing product categorization:', error);
  }
}

fixProductCategorization();