async function fixSamsungCategory() {
  try {
    console.log('Fixing Samsung Galaxy S25 category...');

    // Update the Samsung S25 product to be in Electronics category (ID: 44)
    const response = await fetch('http://localhost:3000/api/products/samsung-galaxy-s25-ultra-ai-smartphone-galaxy-ai', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_id: 44, // Electronics category
        subcategory_id: 45 // Keep smartphones as subcategory
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Samsung Galaxy S25 category updated successfully!');
      console.log('Now in Electronics category (ID: 44)');
      
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
      const error = await response.text();
      console.error('Failed to update category:', error);
    }
  } catch (error) {
    console.error('Error fixing Samsung category:', error);
  }
}

fixSamsungCategory();