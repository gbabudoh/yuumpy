async function checkCreatedSubcategories() {
  try {
    console.log('🔍 Checking Created Subcategories\n');

    // Get all categories
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    console.log('All categories:');
    categories.forEach(cat => {
      const type = cat.parent_id ? 'Subcategory' : 'Main Category';
      console.log(`   ${type}: ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
      if (cat.parent_id) {
        console.log(`     Parent ID: ${cat.parent_id}`);
      }
    });

    // Find Electronics subcategories specifically
    const electronicsSubcategories = categories.filter(c => c.parent_id === 44);
    console.log(`\nElectronics subcategories (${electronicsSubcategories.length}):`);
    electronicsSubcategories.forEach(sub => {
      console.log(`   • ${sub.name} (ID: ${sub.id}, Slug: ${sub.slug})`);
    });

    // Fix the headphones product with the correct subcategory ID
    if (electronicsSubcategories.length > 0) {
      const audioSubcategory = electronicsSubcategories.find(s => 
        s.name.toLowerCase().includes('audio') || s.slug.includes('audio')
      );
      
      if (audioSubcategory) {
        console.log(`\nFound Audio subcategory: ${audioSubcategory.name} (ID: ${audioSubcategory.id})`);
        
        // Get headphones product
        const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
        const allData = await allProductsResponse.json();
        const allProducts = allData.products || allData;
        
        const headphonesProduct = allProducts.find(p => 
          p.name.toLowerCase().includes('headphone')
        );

        if (headphonesProduct) {
          console.log(`\nMoving ${headphonesProduct.name} to Audio subcategory...`);
          
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
            brand_id: headphonesProduct.brand_id,
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
            console.log('✅ Headphones moved to correct subcategory');
          } else {
            console.error('❌ Failed to move headphones');
          }
        }
      }
    }

    // Final verification
    console.log('\n📊 Final Product Structure:');
    const finalResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    const finalData = await finalResponse.json();
    const finalProducts = finalData.products || finalData;
    
    finalProducts.forEach(product => {
      console.log(`   • ${product.name}`);
      console.log(`     📂 ${product.category_name} → 📁 ${product.subcategory_name} → 🏢 ${product.brand_name}`);
    });

    console.log('\n🎯 STRUCTURE SUMMARY:');
    console.log('   📂 Electronics (Main Category)');
    console.log('   ├── 📱 Smartphones (Subcategory)');
    console.log('   ├── 🎧 Audio & Headphones (Subcategory)');
    console.log('   └── ⌚ Wearables (Subcategory)');
    console.log('   🏢 Brands: Google, Samsung, Apple');

  } catch (error) {
    console.error('❌ Error checking subcategories:', error);
  }
}

checkCreatedSubcategories();