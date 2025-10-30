async function fixSamsungCategoryComplete() {
  try {
    console.log('Fixing Samsung Galaxy S25 category with complete data...');

    // First get the current product data
    const getResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    if (!getResponse.ok) {
      console.error('Failed to get current product data');
      return;
    }

    const getData = await getResponse.json();
    const products = getData.products || getData;
    const samsungProduct = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));

    if (!samsungProduct) {
      console.error('Samsung Galaxy S25 product not found');
      return;
    }

    console.log('Current product data:', {
      name: samsungProduct.name,
      category_id: samsungProduct.category_id,
      category_name: samsungProduct.category_name,
      price: samsungProduct.price
    });

    // Update with complete data, changing only the category_id
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
      category_id: 44, // Change to Electronics category
      subcategory_id: samsungProduct.subcategory_id,
      brand_id: samsungProduct.brand_id,
      is_featured: samsungProduct.is_featured ? 1 : 0,
      is_bestseller: samsungProduct.is_bestseller ? 1 : 0,
      is_active: samsungProduct.is_active ? 1 : 0,
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
      const result = await updateResponse.json();
      console.log('Samsung Galaxy S25 category updated successfully!');
      console.log('Changed from category_id:', samsungProduct.category_id, 'to category_id: 44 (Electronics)');
      
      // Test if it now shows in electronics category
      console.log('\nTesting electronics category after fix...');
      const testResponse = await fetch('http://localhost:3000/api/products?category=electronics');
      if (testResponse.ok) {
        const testData = await testResponse.json();
        const testProducts = testData.products || testData;
        const samsungTest = testProducts.filter(p => p.name.toLowerCase().includes('samsung'));
        console.log(`Found ${samsungTest.length} Samsung products in electronics category:`);
        samsungTest.forEach(p => console.log(`- ${p.name} (£${p.price})`));
      }
    } else {
      const error = await updateResponse.text();
      console.error('Failed to update category:', error);
    }
  } catch (error) {
    console.error('Error fixing Samsung category:', error);
  }
}

fixSamsungCategoryComplete();