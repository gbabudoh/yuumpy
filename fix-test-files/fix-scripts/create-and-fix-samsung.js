async function createAndFixSamsung() {
  try {
    console.log('Creating Smartphones subcategory and fixing Samsung Galaxy S25...\n');

    // Step 1: Create Smartphones subcategory under Electronics
    console.log('1. Creating Smartphones subcategory under Electronics...');
    
    // First, let's check what categories exist
    const existingCategoriesResponse = await fetch('http://localhost:3000/api/categories');
    const existingCategories = await existingCategoriesResponse.json();
    
    console.log('Existing categories:');
    existingCategories.forEach(cat => {
      if (cat.name.toLowerCase().includes('smartphone') || cat.name.toLowerCase().includes('electronic')) {
        console.log(`- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id || 'None'}`);
      }
    });

    // Try to create Smartphones subcategory with a unique slug
    const createResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Smartphones',
        slug: 'smartphones-electronics', // Use unique slug
        description: 'Smartphones and mobile devices under Electronics',
        parent_id: 44, // Electronics category
        is_active: true
      })
    });

    let smartphoneSubcategoryId = null;
    if (createResponse.ok) {
      const result = await createResponse.json();
      smartphoneSubcategoryId = result.category?.id || result.id;
      console.log(`✅ Created Smartphones subcategory with ID: ${smartphoneSubcategoryId}`);
    } else {
      const error = await createResponse.text();
      console.log('❌ Failed to create subcategory:', error);
      
      // Try with different slug
      const createResponse2 = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Mobile Phones',
          slug: 'mobile-phones',
          description: 'Mobile phones and smartphones',
          parent_id: 44, // Electronics category
          is_active: true
        })
      });

      if (createResponse2.ok) {
        const result2 = await createResponse2.json();
        smartphoneSubcategoryId = result2.category?.id || result2.id;
        console.log(`✅ Created Mobile Phones subcategory with ID: ${smartphoneSubcategoryId}`);
      } else {
        console.log('❌ Failed to create Mobile Phones subcategory as well');
        // We'll proceed without subcategory
      }
    }

    // Step 2: Update Samsung Galaxy S25 product
    console.log('\n2. Updating Samsung Galaxy S25 product...');

    // Get current Samsung product
    const getResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    const getData = await getResponse.json();
    const products = getData.products || getData;
    const samsungProduct = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));

    if (!samsungProduct) {
      console.error('❌ Samsung Galaxy S25 product not found');
      return;
    }

    console.log('Current Samsung product details:', {
      id: samsungProduct.id,
      name: samsungProduct.name,
      category_id: samsungProduct.category_id,
      subcategory_id: samsungProduct.subcategory_id,
      brand_id: samsungProduct.brand_id,
      is_active: samsungProduct.is_active,
      price: samsungProduct.price
    });

    // Update product with correct categorization
    const updateData = {
      name: samsungProduct.name,
      slug: samsungProduct.slug,
      description: samsungProduct.description || samsungProduct.short_description,
      short_description: samsungProduct.short_description,
      price: parseFloat(samsungProduct.price),
      original_price: samsungProduct.original_price ? parseFloat(samsungProduct.original_price) : null,
      affiliate_url: samsungProduct.affiliate_url,
      affiliate_partner_name: samsungProduct.affiliate_partner_name,
      external_purchase_info: samsungProduct.external_purchase_info,
      image_url: samsungProduct.image_url,
      category_id: 44, // Electronics
      subcategory_id: smartphoneSubcategoryId, // New subcategory or null
      brand_id: 2, // Samsung
      is_featured: 1, // Make sure it's featured
      is_bestseller: samsungProduct.is_bestseller ? 1 : 0,
      is_active: 1, // Make sure it's active
      meta_title: samsungProduct.meta_title,
      meta_description: samsungProduct.meta_description
    };

    const updateResponse = await fetch(`http://localhost:3000/api/products/${samsungProduct.slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      console.log('✅ Samsung Galaxy S25 updated successfully!');
      console.log('New categorization:', {
        category_id: 44,
        category_name: 'Electronics',
        subcategory_id: smartphoneSubcategoryId || 'null',
        subcategory_name: smartphoneSubcategoryId ? 'Smartphones/Mobile Phones' : 'None',
        brand_id: 2,
        brand_name: 'Samsung',
        is_featured: true,
        is_active: true
      });
    } else {
      const error = await updateResponse.text();
      console.error('❌ Failed to update Samsung product:', error);
      return;
    }

    // Step 3: Comprehensive testing
    console.log('\n3. Testing all filter combinations...');

    // Test 1: Electronics category
    console.log('\n📱 Testing Electronics category filter:');
    const electronicsTest = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsTest.ok) {
      const electronicsData = await electronicsTest.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungElectronics.length} Samsung Galaxy S25 in Electronics category`);
      if (samsungElectronics.length > 0) console.log('   ✅ PASS: Shows in Electronics');
      else console.log('   ❌ FAIL: Not showing in Electronics');
    }

    // Test 2: Samsung brand
    console.log('\n🏢 Testing Samsung brand filter:');
    const samsungTest = await fetch('http://localhost:3000/api/products?brand=samsung');
    if (samsungTest.ok) {
      const samsungData = await samsungTest.json();
      const samsungProducts = samsungData.products || samsungData;
      const samsungBrandProducts = samsungProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungBrandProducts.length} Samsung Galaxy S25 with Samsung brand filter`);
      if (samsungBrandProducts.length > 0) console.log('   ✅ PASS: Shows with Samsung brand');
      else console.log('   ❌ FAIL: Not showing with Samsung brand');
    }

    // Test 3: Subcategory (if created)
    if (smartphoneSubcategoryId) {
      console.log('\n📱 Testing subcategory filter:');
      const subcategoryTest = await fetch(`http://localhost:3000/api/products?subcategory=${smartphoneSubcategoryId}`);
      if (subcategoryTest.ok) {
        const subcategoryData = await subcategoryTest.json();
        const subcategoryProducts = subcategoryData.products || subcategoryData;
        const samsungSubcategory = subcategoryProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
        console.log(`   Found ${samsungSubcategory.length} Samsung Galaxy S25 in subcategory`);
        if (samsungSubcategory.length > 0) console.log('   ✅ PASS: Shows in subcategory');
        else console.log('   ❌ FAIL: Not showing in subcategory');
      }
    }

    // Test 4: Combined filters
    console.log('\n🎯 Testing combined filters (Electronics + Samsung):');
    const combinedTest = await fetch('http://localhost:3000/api/products?category=electronics&brand=samsung');
    if (combinedTest.ok) {
      const combinedData = await combinedTest.json();
      const combinedProducts = combinedData.products || combinedData;
      const samsungCombined = combinedProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungCombined.length} Samsung Galaxy S25 with Electronics + Samsung filters`);
      if (samsungCombined.length > 0) {
        console.log('   ✅ PASS: Shows with combined filters');
        console.log('   🎉 SUCCESS: Samsung Galaxy S25 Ultra is now properly categorized!');
      } else {
        console.log('   ❌ FAIL: Not showing with combined filters');
      }
    }

    // Test 5: Featured products
    console.log('\n⭐ Testing featured products:');
    const featuredTest = await fetch('http://localhost:3000/api/products?featured=true');
    if (featuredTest.ok) {
      const featuredData = await featuredTest.json();
      const featuredProducts = featuredData.products || featuredData;
      const samsungFeatured = featuredProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
      console.log(`   Found ${samsungFeatured.length} Samsung Galaxy S25 in featured products`);
      if (samsungFeatured.length > 0) console.log('   ✅ PASS: Shows in featured products');
      else console.log('   ❌ FAIL: Not showing in featured products');
    }

    console.log('\n🏁 Fix completed! Samsung Galaxy S25 Ultra should now be visible in:');
    console.log('   - Electronics category');
    console.log('   - Samsung brand filter');
    console.log('   - Featured products');
    if (smartphoneSubcategoryId) {
      console.log('   - Smartphones/Mobile Phones subcategory');
    }

  } catch (error) {
    console.error('❌ Error in createAndFixSamsung:', error);
  }
}

createAndFixSamsung();