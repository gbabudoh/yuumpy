async function fixSamsungComplete() {
  try {
    console.log('Fixing Samsung Galaxy S25 categorization completely...\n');

    // Step 1: Create Smartphones subcategory under Electronics if it doesn't exist
    console.log('1. Creating Smartphones subcategory under Electronics...');
    const createSubcategoryResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Smartphones and mobile devices',
        parent_id: 44, // Under Electronics
        is_active: true
      })
    });

    let smartphoneSubcategoryId = null;
    if (createSubcategoryResponse.ok) {
      const subcategoryResult = await createSubcategoryResponse.json();
      smartphoneSubcategoryId = subcategoryResult.category?.id || subcategoryResult.id;
      console.log(`Created Smartphones subcategory with ID: ${smartphoneSubcategoryId}`);
    } else {
      // If creation failed, it might already exist, let's check
      console.log('Subcategory creation failed, checking if it already exists...');
      const categoriesResponse = await fetch('http://localhost:3000/api/categories');
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        const smartphoneSubcat = categories.find(c => 
          c.name.toLowerCase().includes('smartphone') && c.parent_id === 44
        );
        if (smartphoneSubcat) {
          smartphoneSubcategoryId = smartphoneSubcat.id;
          console.log(`Found existing Smartphones subcategory with ID: ${smartphoneSubcategoryId}`);
        }
      }
    }

    // Step 2: Get current Samsung product data
    console.log('\n2. Getting current Samsung Galaxy S25 data...');
    const getResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    if (!getResponse.ok) {
      console.error('Failed to get Samsung product data');
      return;
    }

    const getData = await getResponse.json();
    const products = getData.products || getData;
    const samsungProduct = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));

    if (!samsungProduct) {
      console.error('Samsung Galaxy S25 product not found');
      return;
    }

    console.log('Current Samsung product:', {
      id: samsungProduct.id,
      name: samsungProduct.name,
      category_id: samsungProduct.category_id,
      subcategory_id: samsungProduct.subcategory_id,
      brand_id: samsungProduct.brand_id
    });

    // Step 3: Update Samsung product with correct categorization
    console.log('\n3. Updating Samsung Galaxy S25 with correct categorization...');
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
      subcategory_id: smartphoneSubcategoryId || 44, // Smartphones subcategory or fallback to Electronics
      brand_id: 2, // Samsung brand
      is_featured: samsungProduct.is_featured ? 1 : 0,
      is_bestseller: samsungProduct.is_bestseller ? 1 : 0,
      is_active: 1, // Ensure it's active
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
      console.log('Samsung Galaxy S25 updated successfully!');
      console.log('New categorization:', {
        category_id: 44,
        category_name: 'Electronics',
        subcategory_id: smartphoneSubcategoryId || 44,
        subcategory_name: 'Smartphones',
        brand_id: 2,
        brand_name: 'Samsung'
      });
    } else {
      const error = await updateResponse.text();
      console.error('Failed to update Samsung product:', error);
      return;
    }

    // Step 4: Test all filters
    console.log('\n4. Testing all filters after fix...');
    
    // Test Electronics category
    console.log('\nTesting Electronics category:');
    const electronicsTest = await fetch('http://localhost:3000/api/products?category=electronics');
    if (electronicsTest.ok) {
      const electronicsData = await electronicsTest.json();
      const electronicsProducts = electronicsData.products || electronicsData;
      const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungElectronics.length} Samsung products in Electronics category`);
    }

    // Test Smartphones subcategory
    console.log('\nTesting Smartphones subcategory:');
    const smartphonesTest = await fetch('http://localhost:3000/api/products?subcategory=smartphones');
    if (smartphonesTest.ok) {
      const smartphonesData = await smartphonesTest.json();
      const smartphonesProducts = smartphonesData.products || smartphonesData;
      const samsungSmartphones = smartphonesProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungSmartphones.length} Samsung products in Smartphones subcategory`);
    }

    // Test Samsung brand
    console.log('\nTesting Samsung brand:');
    const samsungTest = await fetch('http://localhost:3000/api/products?brand=samsung');
    if (samsungTest.ok) {
      const samsungData = await samsungTest.json();
      const samsungProducts = samsungData.products || samsungData;
      const samsungBrandProducts = samsungProducts.filter(p => p.name.toLowerCase().includes('samsung'));
      console.log(`Found ${samsungBrandProducts.length} Samsung products with Samsung brand filter`);
    }

    // Test combined filters
    console.log('\nTesting combined filters (Electronics + Smartphones + Samsung):');
    const combinedTest = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones&brand=samsung');
    if (combinedTest.ok) {
      const combinedData = await combinedTest.json();
      const combinedProducts = combinedData.products || combinedData;
      console.log(`Found ${combinedProducts.length} products with all filters combined`);
      combinedProducts.forEach(p => console.log(`- ${p.name} (£${p.price})`));
    }

  } catch (error) {
    console.error('Error fixing Samsung complete:', error);
  }
}

fixSamsungComplete();