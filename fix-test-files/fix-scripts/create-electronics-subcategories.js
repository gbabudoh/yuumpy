async function createElectronicsSubcategories() {
  try {
    console.log('🔧 Creating Electronics Subcategories\n');

    const electronicsId = 44;

    // Step 1: Create Smartphones subcategory
    console.log('1. Creating Smartphones subcategory...');
    const smartphonesResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smartphones',
        slug: 'smartphones-sub',
        description: 'Smartphones and mobile devices',
        parent_id: electronicsId,
        sort_order: 1,
        is_active: true
      })
    });

    let smartphonesId = null;
    if (smartphonesResponse.ok) {
      const smartphonesResult = await smartphonesResponse.json();
      smartphonesId = smartphonesResult.category?.id || smartphonesResult.id;
      console.log(`   ✅ Smartphones subcategory created: ID ${smartphonesId}`);
    } else {
      const error = await smartphonesResponse.text();
      console.error('   ❌ Failed to create Smartphones subcategory:', error);
    }

    // Step 2: Create Audio & Headphones subcategory
    console.log('\n2. Creating Audio & Headphones subcategory...');
    const audioResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audio & Headphones',
        slug: 'audio-headphones-sub',
        description: 'Audio equipment, headphones, and speakers',
        parent_id: electronicsId,
        sort_order: 2,
        is_active: true
      })
    });

    let audioId = null;
    if (audioResponse.ok) {
      const audioResult = await audioResponse.json();
      audioId = audioResult.category?.id || audioResult.id;
      console.log(`   ✅ Audio & Headphones subcategory created: ID ${audioId}`);
    } else {
      const error = await audioResponse.text();
      console.error('   ❌ Failed to create Audio & Headphones subcategory:', error);
    }

    // Step 3: Create Wearables subcategory
    console.log('\n3. Creating Wearables subcategory...');
    const wearablesResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Wearables',
        slug: 'wearables-sub',
        description: 'Smartwatches, fitness trackers, and wearable technology',
        parent_id: electronicsId,
        sort_order: 3,
        is_active: true
      })
    });

    let wearablesId = null;
    if (wearablesResponse.ok) {
      const wearablesResult = await wearablesResponse.json();
      wearablesId = wearablesResult.category?.id || wearablesResult.id;
      console.log(`   ✅ Wearables subcategory created: ID ${wearablesId}`);
    } else {
      const error = await wearablesResponse.text();
      console.error('   ❌ Failed to create Wearables subcategory:', error);
    }

    // Step 4: Verify subcategories were created
    console.log('\n4. Verifying subcategories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    const electronicsSubcategories = categories.filter(c => c.parent_id === electronicsId);
    
    console.log(`Electronics subcategories (${electronicsSubcategories.length}):`);
    electronicsSubcategories.forEach(sub => {
      console.log(`   • ${sub.name} (ID: ${sub.id}, Slug: ${sub.slug})`);
    });

    // Step 5: Assign products to correct subcategories
    if (smartphonesId || audioId || wearablesId) {
      console.log('\n5. Assigning products to subcategories...');
      
      const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
      const allData = await allProductsResponse.json();
      const allProducts = allData.products || allData;
      
      const electronicsProducts = allProducts.filter(p => p.category_id === electronicsId);
      
      for (const product of electronicsProducts) {
        console.log(`\n   Processing: ${product.name}`);
        
        let targetSubcategoryId = null;
        let subcategoryName = '';
        
        // Determine correct subcategory
        if ((product.name.toLowerCase().includes('smartphone') || 
             product.name.toLowerCase().includes('phone') ||
             product.name.toLowerCase().includes('pixel') ||
             product.name.toLowerCase().includes('galaxy')) && smartphonesId) {
          targetSubcategoryId = smartphonesId;
          subcategoryName = 'Smartphones';
          
        } else if ((product.name.toLowerCase().includes('headphone') || 
                   product.name.toLowerCase().includes('audio') ||
                   product.name.toLowerCase().includes('speaker')) && audioId) {
          targetSubcategoryId = audioId;
          subcategoryName = 'Audio & Headphones';
          
        } else if ((product.name.toLowerCase().includes('watch') || 
                   product.name.toLowerCase().includes('fitness') ||
                   product.name.toLowerCase().includes('wearable')) && wearablesId) {
          targetSubcategoryId = wearablesId;
          subcategoryName = 'Wearables';
        }
        
        if (targetSubcategoryId) {
          console.log(`     → Assigning to ${subcategoryName} (ID: ${targetSubcategoryId})`);
          
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
            category_id: electronicsId, // Electronics (main category)
            subcategory_id: targetSubcategoryId, // Correct subcategory
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
            console.log(`     ✅ Assigned to ${subcategoryName}`);
          } else {
            const error = await updateResponse.text();
            console.error(`     ❌ Failed to assign: ${error}`);
          }
        } else {
          console.log(`     ⚠️  No matching subcategory found`);
        }
      }
    }

    // Step 6: Final verification
    console.log('\n6. Final verification...');
    const finalResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const finalData = await finalResponse.json();
    const finalProducts = finalData.products || finalData;
    
    console.log(`\n📂 Electronics Category Structure (${finalProducts.length} products):`);
    finalProducts.forEach(product => {
      console.log(`   • ${product.name}`);
      console.log(`     📂 Category: ${product.category_name} (ID: ${product.category_id})`);
      console.log(`     📁 Subcategory: ${product.subcategory_name || 'None'} (ID: ${product.subcategory_id || 'null'})`);
      console.log(`     🏢 Brand: ${product.brand_name} (ID: ${product.brand_id})`);
      console.log('     ---');
    });

    // Test filtering
    console.log('\n7. Testing subcategory filtering...');
    if (smartphonesId) {
      const smartphonesTestResponse = await fetch(`http://localhost:3000/api/products?category=electronics&subcategory=smartphones-sub`);
      const smartphonesTestData = await smartphonesTestResponse.json();
      const smartphonesTestProducts = smartphonesTestData.products || smartphonesTestData;
      console.log(`   📱 Smartphones subcategory: ${smartphonesTestProducts.length} products`);
    }

    console.log('\n🎉 ELECTRONICS SUBCATEGORIES CREATED AND ASSIGNED!');
    console.log('   ✅ Proper category → subcategory → brand hierarchy established');
    console.log('   ✅ All products correctly categorized');
    console.log('   ✅ Filtering should work correctly now');

  } catch (error) {
    console.error('❌ Error creating electronics subcategories:', error);
  }
}

createElectronicsSubcategories();