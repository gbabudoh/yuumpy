async function createSmartphonesSubcategory() {
  try {
    console.log('Creating Smartphones subcategory under Electronics...\n');

    // Check if subcategories API endpoint exists
    const subcategoriesResponse = await fetch('http://localhost:3000/api/subcategories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Smartphones and mobile devices',
        parent_id: 44, // Electronics category
        is_active: true
      })
    });

    if (subcategoriesResponse.ok) {
      const result = await subcategoriesResponse.json();
      console.log('Smartphones subcategory created:', result);
      return result.subcategory?.id || result.id;
    } else {
      console.log('Subcategories API not available, trying categories API...');
      
      // Try using categories API with parent_id
      const categoriesResponse = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Smartphones',
          slug: 'smartphones',
          description: 'Smartphones and mobile devices',
          parent_id: 44, // Electronics category
          is_active: true
        })
      });

      if (categoriesResponse.ok) {
        const result = await categoriesResponse.json();
        console.log('Smartphones subcategory created via categories API:', result);
        return result.category?.id || result.id;
      } else {
        const error = await categoriesResponse.text();
        console.error('Failed to create subcategory:', error);
        return null;
      }
    }
  } catch (error) {
    console.error('Error creating smartphones subcategory:', error);
    return null;
  }
}

async function updateSamsungWithSubcategory() {
  try {
    // Create subcategory first
    const subcategoryId = await createSmartphonesSubcategory();
    
    if (!subcategoryId) {
      console.log('Could not create subcategory, using Electronics as subcategory...');
      // We'll use Electronics (44) as both category and subcategory
    }

    console.log('\nUpdating Samsung Galaxy S25 with proper subcategory...');

    // Get current Samsung product
    const getResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    const getData = await getResponse.json();
    const products = getData.products || getData;
    const samsungProduct = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));

    if (!samsungProduct) {
      console.error('Samsung product not found');
      return;
    }

    // Update with proper subcategory
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
      subcategory_id: subcategoryId || null, // New Smartphones subcategory or null
      brand_id: 2, // Samsung
      is_featured: samsungProduct.is_featured ? 1 : 0,
      is_bestseller: samsungProduct.is_bestseller ? 1 : 0,
      is_active: 1,
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
      console.log('Samsung Galaxy S25 updated with subcategory!');
      console.log('Final categorization:', {
        category_id: 44,
        subcategory_id: subcategoryId || 'null',
        brand_id: 2
      });

      // Final test
      console.log('\nFinal test - Combined filters:');
      const testUrl = subcategoryId 
        ? 'http://localhost:3000/api/products?category=electronics&subcategory=smartphones&brand=samsung'
        : 'http://localhost:3000/api/products?category=electronics&brand=samsung';
      
      const finalTest = await fetch(testUrl);
      if (finalTest.ok) {
        const finalData = await finalTest.json();
        const finalProducts = finalData.products || finalData;
        console.log(`Found ${finalProducts.length} products with filters`);
        finalProducts.forEach(p => console.log(`- ${p.name} (£${p.price})`));
      }
    } else {
      const error = await updateResponse.text();
      console.error('Failed to update Samsung product:', error);
    }

  } catch (error) {
    console.error('Error updating Samsung with subcategory:', error);
  }
}

updateSamsungWithSubcategory();