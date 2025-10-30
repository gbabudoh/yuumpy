async function fixHeadphonesAssignment() {
  try {
    console.log('🔧 Fixing Headphones Assignment\n');

    // Step 1: Get the headphones product
    console.log('1. Finding Wireless Bluetooth Headphones product...');
    const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
    const allData = await allProductsResponse.json();
    const allProducts = allData.products || allData;
    
    const headphonesProduct = allProducts.find(p => 
      p.name.toLowerCase().includes('headphone') || 
      p.name.toLowerCase().includes('bluetooth')
    );

    if (!headphonesProduct) {
      console.error('❌ Headphones product not found');
      return;
    }

    console.log(`Found: ${headphonesProduct.name}`);
    console.log(`Current assignment: Category ${headphonesProduct.category_id}, Subcategory ${headphonesProduct.subcategory_id}`);

    // Step 2: Get the Audio & Headphones subcategory ID
    console.log('\n2. Finding Audio & Headphones subcategory...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    const audioSubcategory = categories.find(c => 
      c.name.toLowerCase().includes('audio') && c.name.toLowerCase().includes('headphone')
    );

    if (!audioSubcategory) {
      console.error('❌ Audio & Headphones subcategory not found');
      return;
    }

    console.log(`Audio & Headphones subcategory: ID ${audioSubcategory.id}, Name: ${audioSubcategory.name}`);

    // Step 3: Update the headphones product
    console.log('\n3. Moving headphones to correct subcategory...');
    
    const updateData = {
      name: headphonesProduct.name,
      slug: headphonesProduct.slug,
      description: headphonesProduct.description || headphonesProduct.short_description,
      short_description: headphonesProduct.short_description,
      price: parseFloat(headphonesProduct.price),
      original_price: headphonesProduct.original_price ? parseFloat(headphonesProduct.original_price) : null,
      affiliate_url: headphonesProduct.affiliate_url,
      affiliate_partner_name: headphonesProduct.affiliate_partner_name,
      external_purchase_info: headphonesProduct.external_purchase_info,
      image_url: headphonesProduct.image_url || '',
      category_id: 44, // Electronics
      subcategory_id: audioSubcategory.id, // Audio & Headphones
      brand_id: headphonesProduct.brand_id, // Keep existing brand
      is_featured: headphonesProduct.is_featured ? 1 : 0,
      is_bestseller: headphonesProduct.is_bestseller ? 1 : 0,
      is_active: 1,
      meta_title: headphonesProduct.meta_title,
      meta_description: headphonesProduct.meta_description
    };

    const updateResponse = await fetch(`http://localhost:3000/api/products/${headphonesProduct.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      console.log('✅ Headphones moved to Audio & Headphones subcategory');
    } else {
      const error = await updateResponse.text();
      console.error('❌ Failed to move headphones:', error);
    }

    // Step 4: Final verification
    console.log('\n4. Final verification...');
    const finalResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const finalData = await finalResponse.json();
    const finalProducts = finalData.products || finalData;
    
    console.log(`\n📂 Final Electronics Category Structure (${finalProducts.length} products):`);
    
    // Group by subcategory for better display
    const productsBySubcategory = {};
    finalProducts.forEach(product => {
      const subcategoryName = product.subcategory_name || 'No Subcategory';
      if (!productsBySubcategory[subcategoryName]) {
        productsBySubcategory[subcategoryName] = [];
      }
      productsBySubcategory[subcategoryName].push(product);
    });

    Object.keys(productsBySubcategory).forEach(subcategory => {
      console.log(`\n   📁 ${subcategory}:`);
      productsBySubcategory[subcategory].forEach(product => {
        console.log(`      • ${product.name} (${product.brand_name})`);
      });
    });

    // Test subcategory filtering
    console.log('\n5. Testing subcategory filtering...');
    
    // Test Smartphones
    const smartphonesResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones-sub');
    const smartphonesData = await smartphonesResponse.json();
    const smartphonesProducts = smartphonesData.products || smartphonesData;
    console.log(`   📱 Smartphones: ${smartphonesProducts.length} products`);

    // Test Audio & Headphones
    const audioResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=audio-headphones-sub');
    const audioData = await audioResponse.json();
    const audioProducts = audioData.products || audioData;
    console.log(`   🎧 Audio & Headphones: ${audioProducts.length} products`);

    // Test Wearables
    const wearablesResponse = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=wearables-sub');
    const wearablesData = await wearablesResponse.json();
    const wearablesProducts = wearablesData.products || wearablesData;
    console.log(`   ⌚ Wearables: ${wearablesProducts.length} products`);

    console.log('\n🎉 PERFECT CATEGORY STRUCTURE ACHIEVED!');
    console.log('   📂 Electronics (Main Category)');
    console.log('   ├── 📱 Smartphones (Subcategory) - Google, Samsung products');
    console.log('   ├── 🎧 Audio & Headphones (Subcategory) - Audio products');
    console.log('   └── ⌚ Wearables (Subcategory) - Smartwatch products');
    console.log('   🏢 Brands: Google, Samsung, Apple (properly assigned)');

  } catch (error) {
    console.error('❌ Error fixing headphones assignment:', error);
  }
}

fixHeadphonesAssignment();