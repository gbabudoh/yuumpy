async function investigateProductDisplayIssue() {
  try {
    console.log('🔍 Investigating Product Display Issue\n');

    // Step 1: Check all products in database
    console.log('1. Checking all products in database...');
    const allProductsResponse = await fetch('http://localhost:3000/api/products?admin=true&limit=50');
    if (allProductsResponse.ok) {
      const allData = await allProductsResponse.json();
      const allProducts = allData.products || allData;
      
      console.log(`Total products in database: ${allProducts.length}`);
      
      // Group by category
      const productsByCategory = {};
      allProducts.forEach(product => {
        const categoryName = product.category_name || 'Unknown';
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = [];
        }
        productsByCategory[categoryName].push({
          id: product.id,
          name: product.name,
          category_id: product.category_id,
          subcategory_id: product.subcategory_id,
          brand_id: product.brand_id,
          is_active: product.is_active,
          category_name: product.category_name,
          subcategory_name: product.subcategory_name,
          brand_name: product.brand_name
        });
      });

      console.log('\nProducts by category:');
      Object.keys(productsByCategory).forEach(category => {
        console.log(`\n📂 ${category} (${productsByCategory[category].length} products):`);
        productsByCategory[category].forEach(product => {
          console.log(`   • ${product.name}`);
          console.log(`     Category ID: ${product.category_id}, Subcategory ID: ${product.subcategory_id}`);
          console.log(`     Brand: ${product.brand_name} (ID: ${product.brand_id})`);
          console.log(`     Active: ${product.is_active ? 'Yes' : 'No'}`);
        });
      });
    }

    // Step 2: Test Electronics category filter specifically
    console.log('\n2. Testing Electronics category filter...');
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsResponse.ok) {
      const electronicsData = await electronicsResponse.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      
      console.log(`\n📱 Electronics category filter results: ${electronicsProducts.length} products`);
      electronicsProducts.forEach(product => {
        console.log(`   • ${product.name} (Category: ${product.category_name}, Subcategory: ${product.subcategory_name})`);
      });
    } else {
      console.error('❌ Electronics category filter failed');
    }

    // Step 3: Check category IDs and slugs
    console.log('\n3. Checking category structure...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      
      console.log('\nCategory structure:');
      categories.forEach(category => {
        console.log(`   • ID: ${category.id}, Name: ${category.name}, Slug: ${category.slug}`);
        console.log(`     Parent ID: ${category.parent_id || 'None'}, Active: ${category.is_active}`);
      });
      
      // Find Electronics category
      const electronicsCategory = categories.find(c => c.slug === 'electronics');
      if (electronicsCategory) {
        console.log(`\n📱 Electronics category found: ID ${electronicsCategory.id}`);
      } else {
        console.error('❌ Electronics category not found!');
      }
    }

    // Step 4: Check for potential issues
    console.log('\n4. 🔍 POTENTIAL ISSUES TO CHECK:');
    console.log('   A) Products have wrong category_id');
    console.log('   B) Products are inactive (is_active = 0)');
    console.log('   C) Category filtering logic is broken');
    console.log('   D) Database inconsistencies');
    console.log('   E) API filtering parameters are wrong');

    console.log('\n5. 🎯 NEXT STEPS:');
    console.log('   • Fix any products with wrong category assignments');
    console.log('   • Ensure all products are active');
    console.log('   • Fix API filtering logic if needed');
    console.log('   • Test all category/subcategory/brand combinations');

  } catch (error) {
    console.error('❌ Error investigating product display issue:', error);
  }
}

investigateProductDisplayIssue();