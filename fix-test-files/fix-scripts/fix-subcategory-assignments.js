async function fixSubcategoryAssignments() {
  try {
    console.log('🔧 Fixing Subcategory Assignments\n');

    // Step 1: Get all categories including subcategories
    console.log('1. Getting all categories and subcategories...');
    const allCategoriesResponse = await fetch('http://localhost:3000/api/categories');
    const allCategories = await allCategoriesResponse.json();
    
    console.log(`Found ${allCategories.length} total categories`);
    
    // Show all categories with their parent relationships
    console.log('\nAll categories:');
    allCategories.forEach(cat => {
      const type = cat.parent_id ? 'Subcategory' : 'Main Category';
      console.log(`   ${type}: ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
      if (cat.parent_id) {
        const parent = allCategories.find(p => p.id === cat.parent_id);
        console.log(`     Under: ${parent?.name || 'Unknown'} (ID: ${cat.parent_id})`);
      }
    });

    // Step 2: Find existing subcategories that we can use
    const electronicsId = 44;
    const existingSubcategories = allCategories.filter(c => c.parent_id === electronicsId);
    
    console.log(`\n2. Existing subcategories under Electronics (ID: ${electronicsId}):`);
    if (existingSubcategories.length === 0) {
      console.log('   No subcategories found under Electronics');
      
      // Let's check if there are any categories that should be subcategories
      const potentialSubcategories = allCategories.filter(c => 
        c.name.toLowerCase().includes('smartphone') ||
        c.name.toLowerCase().includes('audio') ||
        c.name.toLowerCase().includes('headphone') ||
        c.name.toLowerCase().includes('wearable') ||
        c.name.toLowerCase().includes('mobile')
      );
      
      console.log('\n   Potential subcategories found:');
      potentialSubcategories.forEach(cat => {
        console.log(`   • ${cat.name} (ID: ${cat.id}, Parent: ${cat.parent_id || 'None'})`);
      });
      
      // Use existing categories as subcategories by updating their parent_id
      if (potentialSubcategories.length > 0) {
        console.log('\n3. Converting existing categories to subcategories...');
        
        for (const cat of potentialSubcategories) {
          console.log(`   Converting ${cat.name} to subcategory under Electronics...`);
          
          const updateResponse = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image_url: cat.image_url,
              icon_url: cat.icon_url,
              parent_id: electronicsId, // Make it a subcategory of Electronics
              sort_order: cat.sort_order,
              is_active: cat.is_active
            })
          });
          
          if (updateResponse.ok) {
            console.log(`     ✅ ${cat.name} is now a subcategory of Electronics`);
          } else {
            console.error(`     ❌ Failed to convert ${cat.name}`);
          }
        }
      }
    } else {
      existingSubcategories.forEach(sub => {
        console.log(`   • ${sub.name} (ID: ${sub.id}, Slug: ${sub.slug})`);
      });
    }

    // Step 3: Get updated category list
    console.log('\n4. Getting updated category structure...');
    const updatedCategoriesResponse = await fetch('http://localhost:3000/api/categories');
    const updatedCategories = await updatedCategoriesResponse.json();
    
    const electronicsSubcategories = updatedCategories.filter(c => c.parent_id === electronicsId);
    console.log(`\nElectronics subcategories (${electronicsSubcategories.length}):`);
    electronicsSubcategories.forEach(sub => {
      console.log(`   • ${sub.name} (ID: ${sub.id}, Slug: ${sub.slug})`);
    });

    // Step 4: Assign products to correct subcategories
    console.log('\n5. Assigning products to correct subcategories...');
    
    const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
    const allData = await allProductsResponse.json();
    const allProducts = allData.products || allData;
    
    const electronicsProducts = allProducts.filter(p => p.category_id === electronicsId);
    console.log(`\nFound ${electronicsProducts.length} products in Electronics category:`);
    
    for (const product of electronicsProducts) {
      console.log(`\n   Processing: ${product.name}`);
      
      let targetSubcategoryId = null;
      
      // Determine correct subcategory based on product name/type
      if (product.name.toLowerCase().includes('smartphone') || 
          product.name.toLowerCase().includes('phone') ||
          product.name.toLowerCase().includes('pixel') ||
          product.name.toLowerCase().includes('galaxy')) {
        
        const smartphoneSubcat = electronicsSubcategories.find(s => 
          s.name.toLowerCase().includes('smartphone') || s.name.toLowerCase().includes('mobile')
        );
        targetSubcategoryId = smartphoneSubcat?.id;
        console.log(`     → Should be in Smartphones subcategory (ID: ${targetSubcategoryId})`);
        
      } else if (product.name.toLowerCase().includes('headphone') || 
                 product.name.toLowerCase().includes('audio') ||
                 product.name.toLowerCase().includes('speaker')) {
        
        const audioSubcat = electronicsSubcategories.find(s => 
          s.name.toLowerCase().includes('audio') || s.name.toLowerCase().includes('headphone')
        );
        targetSubcategoryId = audioSubcat?.id;
        console.log(`     → Should be in Audio subcategory (ID: ${targetSubcategoryId})`);
        
      } else if (product.name.toLowerCase().includes('watch') || 
                 product.name.toLowerCase().includes('fitness') ||
                 product.name.toLowerCase().includes('wearable')) {
        
        const wearableSubcat = electronicsSubcategories.find(s => 
          s.name.toLowerCase().includes('wearable') || s.name.toLowerCase().includes('watch')
        );
        targetSubcategoryId = wearableSubcat?.id;
        console.log(`     → Should be in Wearables subcategory (ID: ${targetSubcategoryId})`);
      }
      
      // Update product with correct subcategory
      if (targetSubcategoryId && targetSubcategoryId !== product.subcategory_id) {
        console.log(`     Updating subcategory from ${product.subcategory_id} to ${targetSubcategoryId}...`);
        
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
          category_id: electronicsId, // Electronics
          subcategory_id: targetSubcategoryId, // Correct subcategory
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
          console.log(`     ✅ Updated successfully`);
        } else {
          console.error(`     ❌ Failed to update`);
        }
      } else if (!targetSubcategoryId) {
        console.log(`     ⚠️  No matching subcategory found - keeping current assignment`);
      } else {
        console.log(`     ✅ Already correctly assigned`);
      }
    }

    // Step 6: Final verification
    console.log('\n6. Final verification...');
    const finalResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const finalData = await finalResponse.json();
    const finalProducts = finalData.products || finalData;
    
    console.log(`\n📂 Final Electronics Category Structure (${finalProducts.length} products):`);
    finalProducts.forEach(product => {
      console.log(`   • ${product.name}`);
      console.log(`     Category: ${product.category_name} (ID: ${product.category_id})`);
      console.log(`     Subcategory: ${product.subcategory_name || 'None'} (ID: ${product.subcategory_id || 'null'})`);
      console.log(`     Brand: ${product.brand_name} (ID: ${product.brand_id})`);
      console.log('     ---');
    });

    console.log('\n🎉 SUBCATEGORY ASSIGNMENT COMPLETED!');

  } catch (error) {
    console.error('❌ Error fixing subcategory assignments:', error);
  }
}

fixSubcategoryAssignments();