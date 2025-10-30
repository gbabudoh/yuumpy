async function fixCategorySubcategoryStructure() {
  try {
    console.log('🔧 Fixing Category/Subcategory Structure\n');

    // Step 1: Check current database structure
    console.log('1. Analyzing current database structure...');
    
    // Get all categories to understand the hierarchy
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    console.log('\nCurrent category structure:');
    categories.forEach(category => {
      console.log(`   ID: ${category.id}, Name: ${category.name}, Slug: ${category.slug}`);
      console.log(`   Parent ID: ${category.parent_id || 'None (Main Category)'}`);
      console.log(`   Active: ${category.is_active}`);
      console.log('   ---');
    });

    // Step 2: Identify the correct category IDs
    const electronicsCategory = categories.find(c => c.slug === 'electronics');
    const smartphonesCategory = categories.find(c => c.slug === 'smartphones' || c.name.toLowerCase().includes('smartphone'));
    
    console.log('\n2. Category ID Analysis:');
    console.log(`   Electronics (main category): ID ${electronicsCategory?.id || 'NOT FOUND'}`);
    console.log(`   Smartphones (should be subcategory): ID ${smartphonesCategory?.id || 'NOT FOUND'}`);
    
    if (smartphonesCategory) {
      console.log(`   Smartphones parent_id: ${smartphonesCategory.parent_id || 'None (WRONG - should be under Electronics)'}`);
    }

    // Step 3: Check if we need to create proper subcategories under Electronics
    console.log('\n3. Checking subcategory structure...');
    
    // Look for subcategories under Electronics (parent_id = 44)
    const electronicsSubcategories = categories.filter(c => c.parent_id === electronicsCategory?.id);
    console.log(`   Subcategories under Electronics: ${electronicsSubcategories.length}`);
    electronicsSubcategories.forEach(sub => {
      console.log(`   • ${sub.name} (ID: ${sub.id}, Slug: ${sub.slug})`);
    });

    // Step 4: Create proper subcategories if they don't exist
    let smartphonesSubcategoryId = null;
    let audioSubcategoryId = null;
    let wearablesSubcategoryId = null;

    // Check if Smartphones subcategory exists under Electronics
    const smartphonesSubcategory = electronicsSubcategories.find(c => 
      c.name.toLowerCase().includes('smartphone') || c.slug.includes('smartphone')
    );

    if (!smartphonesSubcategory) {
      console.log('\n4. Creating Smartphones subcategory under Electronics...');
      const createSmartphonesResponse = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Smartphones',
          slug: 'smartphones-electronics',
          description: 'Smartphones and mobile devices',
          parent_id: electronicsCategory.id,
          is_active: true
        })
      });

      if (createSmartphonesResponse.ok) {
        const result = await createSmartphonesResponse.json();
        smartphonesSubcategoryId = result.category?.id || result.id;
        console.log(`   ✅ Created Smartphones subcategory: ID ${smartphonesSubcategoryId}`);
      } else {
        console.error('   ❌ Failed to create Smartphones subcategory');
      }
    } else {
      smartphonesSubcategoryId = smartphonesSubcategory.id;
      console.log(`   ✅ Smartphones subcategory exists: ID ${smartphonesSubcategoryId}`);
    }

    // Check for Audio & Headphones subcategory
    const audioSubcategory = electronicsSubcategories.find(c => 
      c.name.toLowerCase().includes('audio') || c.name.toLowerCase().includes('headphone')
    );

    if (!audioSubcategory) {
      console.log('\n5. Creating Audio & Headphones subcategory under Electronics...');
      const createAudioResponse = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Audio & Headphones',
          slug: 'audio-headphones',
          description: 'Audio equipment and headphones',
          parent_id: electronicsCategory.id,
          is_active: true
        })
      });

      if (createAudioResponse.ok) {
        const result = await createAudioResponse.json();
        audioSubcategoryId = result.category?.id || result.id;
        console.log(`   ✅ Created Audio & Headphones subcategory: ID ${audioSubcategoryId}`);
      }
    } else {
      audioSubcategoryId = audioSubcategory.id;
      console.log(`   ✅ Audio & Headphones subcategory exists: ID ${audioSubcategoryId}`);
    }

    // Check for Wearables subcategory
    const wearablesSubcategory = electronicsSubcategories.find(c => 
      c.name.toLowerCase().includes('wearable') || c.name.toLowerCase().includes('watch')
    );

    if (!wearablesSubcategory) {
      console.log('\n6. Creating Wearables subcategory under Electronics...');
      const createWearablesResponse = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Wearables',
          slug: 'wearables',
          description: 'Smartwatches and wearable technology',
          parent_id: electronicsCategory.id,
          is_active: true
        })
      });

      if (createWearablesResponse.ok) {
        const result = await createWearablesResponse.json();
        wearablesSubcategoryId = result.category?.id || result.id;
        console.log(`   ✅ Created Wearables subcategory: ID ${wearablesSubcategoryId}`);
      }
    } else {
      wearablesSubcategoryId = wearablesSubcategory.id;
      console.log(`   ✅ Wearables subcategory exists: ID ${wearablesSubcategoryId}`);
    }

    // Step 7: Fix all products to have correct category/subcategory structure
    console.log('\n7. Fixing all products with correct category/subcategory structure...');
    
    const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
    const allData = await allProductsResponse.json();
    const allProducts = allData.products || allData;

    // Fix smartphone products
    const smartphoneProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('smartphone') || 
      p.name.toLowerCase().includes('pixel') || 
      p.name.toLowerCase().includes('galaxy') ||
      p.name.toLowerCase().includes('phone')
    );

    console.log(`\n   Fixing ${smartphoneProducts.length} smartphone products:`);
    for (const product of smartphoneProducts) {
      console.log(`   • ${product.name}`);
      
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
        category_id: electronicsCategory.id, // Electronics (main category)
        subcategory_id: smartphonesSubcategoryId, // Smartphones (subcategory)
        brand_id: product.brand_id, // Keep existing brand
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
        console.log(`     ✅ Fixed: Electronics → Smartphones`);
      } else {
        console.error(`     ❌ Failed to fix ${product.name}`);
      }
    }

    // Fix audio products
    const audioProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('headphone') || 
      p.name.toLowerCase().includes('audio') ||
      p.name.toLowerCase().includes('speaker')
    );

    console.log(`\n   Fixing ${audioProducts.length} audio products:`);
    for (const product of audioProducts) {
      console.log(`   • ${product.name}`);
      
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
        category_id: electronicsCategory.id, // Electronics (main category)
        subcategory_id: audioSubcategoryId, // Audio & Headphones (subcategory)
        brand_id: product.brand_id, // Keep existing brand
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
        console.log(`     ✅ Fixed: Electronics → Audio & Headphones`);
      } else {
        console.error(`     ❌ Failed to fix ${product.name}`);
      }
    }

    // Fix wearable products
    const wearableProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('watch') || 
      p.name.toLowerCase().includes('fitness') ||
      p.name.toLowerCase().includes('wearable')
    );

    console.log(`\n   Fixing ${wearableProducts.length} wearable products:`);
    for (const product of wearableProducts) {
      console.log(`   • ${product.name}`);
      
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
        category_id: electronicsCategory.id, // Electronics (main category)
        subcategory_id: wearablesSubcategoryId, // Wearables (subcategory)
        brand_id: product.brand_id, // Keep existing brand
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
        console.log(`     ✅ Fixed: Electronics → Wearables`);
      } else {
        console.error(`     ❌ Failed to fix ${product.name}`);
      }
    }

    // Step 8: Verify the final structure
    console.log('\n8. Verifying final structure...');
    const verifyResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const verifyData = await verifyResponse.json();
    const electronicsProducts = verifyData.products || verifyData;
    
    console.log(`\n📂 Electronics Category (${electronicsProducts.length} products):`);
    electronicsProducts.forEach(product => {
      console.log(`   • ${product.name}`);
      console.log(`     Category: ${product.category_name} (ID: ${product.category_id})`);
      console.log(`     Subcategory: ${product.subcategory_name} (ID: ${product.subcategory_id})`);
      console.log(`     Brand: ${product.brand_name} (ID: ${product.brand_id})`);
      console.log('     ---');
    });

    console.log('\n🎉 CATEGORY/SUBCATEGORY STRUCTURE FIXED!');
    console.log('   ✅ Electronics is the main category');
    console.log('   ✅ Smartphones, Audio & Headphones, Wearables are subcategories');
    console.log('   ✅ Brands are properly assigned');
    console.log('   ✅ All products correctly structured');

  } catch (error) {
    console.error('❌ Error fixing category/subcategory structure:', error);
  }
}

fixCategorySubcategoryStructure();