async function findSmartphonesSubcategory() {
  try {
    console.log('Finding existing Smartphones subcategory...\n');

    // Get all categories to find the Smartphones subcategory
    const response = await fetch('http://localhost:3000/api/categories');
    if (response.ok) {
      const categories = await response.json();
      
      console.log('Looking for Smartphones subcategory...');
      const smartphoneCategories = categories.filter(c => 
        c.name.toLowerCase().includes('smartphone') || 
        c.slug.includes('smartphone')
      );
      
      console.log('Smartphone-related categories found:');
      smartphoneCategories.forEach(cat => {
        console.log(`- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id || 'None'}`);
      });

      // Look for one that's a subcategory of Electronics (parent_id: 44)
      const smartphoneSubcat = smartphoneCategories.find(c => c.parent_id === 44);
      
      if (smartphoneSubcat) {
        console.log(`\nFound Smartphones subcategory under Electronics: ID ${smartphoneSubcat.id}`);
        return smartphoneSubcat.id;
      } else {
        console.log('\nNo Smartphones subcategory found under Electronics');
        
        // Check if there's a standalone Smartphones category we can use
        const standaloneSmartphone = smartphoneCategories.find(c => !c.parent_id);
        if (standaloneSmartphone) {
          console.log(`Found standalone Smartphones category: ID ${standaloneSmartphone.id}`);
          return standaloneSmartphone.id;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding smartphones subcategory:', error);
    return null;
  }
}

async function updateSamsungWithCorrectSubcategory() {
  try {
    const smartphoneSubcategoryId = await findSmartphonesSubcategory();
    
    if (!smartphoneSubcategoryId) {
      console.log('No Smartphones subcategory found, product will remain without subcategory');
      return;
    }

    console.log(`\nUpdating Samsung Galaxy S25 with subcategory ID: ${smartphoneSubcategoryId}`);

    // Get current Samsung product
    const getResponse = await fetch('http://localhost:3000/api/products?search=Samsung%20Galaxy%20S25');
    const getData = await getResponse.json();
    const products = getData.products || getData;
    const samsungProduct = products.find(p => p.name.toLowerCase().includes('samsung galaxy s25'));

    if (!samsungProduct) {
      console.error('Samsung product not found');
      return;
    }

    // Update with correct subcategory
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
      subcategory_id: smartphoneSubcategoryId, // Correct Smartphones subcategory
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
      console.log('Samsung Galaxy S25 updated successfully!');
      
      // Test all filters
      console.log('\nTesting all filters:');
      
      // Test Electronics category
      console.log('\n1. Electronics category:');
      const electronicsTest = await fetch('http://localhost:3000/api/products?category=electronics');
      if (electronicsTest.ok) {
        const electronicsData = await electronicsTest.json();
        const electronicsProducts = electronicsData.products || electronicsData;
        const samsungElectronics = electronicsProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
        console.log(`Found ${samsungElectronics.length} Samsung Galaxy S25 in Electronics`);
      }

      // Test Smartphones subcategory
      console.log('\n2. Smartphones subcategory:');
      const smartphonesTest = await fetch('http://localhost:3000/api/products?subcategory=smartphones');
      if (smartphonesTest.ok) {
        const smartphonesData = await smartphonesTest.json();
        const smartphonesProducts = smartphonesData.products || smartphonesData;
        const samsungSmartphones = smartphonesProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
        console.log(`Found ${samsungSmartphones.length} Samsung Galaxy S25 in Smartphones subcategory`);
      }

      // Test Samsung brand
      console.log('\n3. Samsung brand:');
      const samsungTest = await fetch('http://localhost:3000/api/products?brand=samsung');
      if (samsungTest.ok) {
        const samsungData = await samsungTest.json();
        const samsungProducts = samsungData.products || samsungData;
        const samsungBrandProducts = samsungProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
        console.log(`Found ${samsungBrandProducts.length} Samsung Galaxy S25 with Samsung brand`);
      }

      // Test combined filters
      console.log('\n4. Combined filters (Electronics + Smartphones + Samsung):');
      const combinedTest = await fetch('http://localhost:3000/api/products?category=electronics&subcategory=smartphones&brand=samsung');
      if (combinedTest.ok) {
        const combinedData = await combinedTest.json();
        const combinedProducts = combinedData.products || combinedData;
        const samsungCombined = combinedProducts.filter(p => p.name.toLowerCase().includes('samsung galaxy s25'));
        console.log(`Found ${samsungCombined.length} Samsung Galaxy S25 with all filters combined`);
        if (samsungCombined.length > 0) {
          console.log('✅ SUCCESS: Samsung Galaxy S25 Ultra now shows up with all filters!');
        }
      }

    } else {
      const error = await updateResponse.text();
      console.error('Failed to update Samsung product:', error);
    }

  } catch (error) {
    console.error('Error updating Samsung with correct subcategory:', error);
  }
}

updateSamsungWithCorrectSubcategory();