async function debugCategoryUpdateIssue() {
  try {
    console.log('🔍 Debugging Category Update Issue\n');

    // Step 1: Test basic API connectivity
    console.log('1. Testing API connectivity...');
    const healthCheck = await fetch('http://localhost:3000/api/categories');
    if (!healthCheck.ok) {
      console.error('❌ API is not responding. Server might be down.');
      return;
    }
    console.log('✅ API is responding');

    // Step 2: Get a category to test with
    console.log('\n2. Getting categories for testing...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    const testCategory = categories.find(c => c.slug === 'electronics');
    if (!testCategory) {
      console.error('❌ Electronics category not found for testing');
      return;
    }
    
    console.log('✅ Found test category:', {
      id: testCategory.id,
      name: testCategory.name,
      slug: testCategory.slug,
      icon_url: testCategory.icon_url
    });

    // Step 3: Test different update scenarios that might fail
    console.log('\n3. Testing different update scenarios...');

    // Scenario 1: Minimal update (just icon change)
    console.log('\n   Scenario 1: Minimal icon update');
    const minimalUpdate = {
      name: testCategory.name,
      slug: testCategory.slug,
      description: testCategory.description,
      image_url: testCategory.image_url,
      icon_url: '🔌', // Change icon
      parent_id: testCategory.parent_id,
      sort_order: testCategory.sort_order,
      is_active: testCategory.is_active
    };

    const minimalResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalUpdate)
    });

    if (minimalResponse.ok) {
      console.log('   ✅ Minimal update successful');
    } else {
      const error = await minimalResponse.text();
      console.log('   ❌ Minimal update failed:', error);
    }

    // Scenario 2: Update with missing fields (common frontend issue)
    console.log('\n   Scenario 2: Update with potentially missing fields');
    const incompleteUpdate = {
      name: testCategory.name,
      slug: testCategory.slug,
      icon_url: '⚡' // Only essential fields
    };

    const incompleteResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteUpdate)
    });

    if (incompleteResponse.ok) {
      console.log('   ✅ Incomplete update successful');
    } else {
      const error = await incompleteResponse.text();
      console.log('   ❌ Incomplete update failed:', error);
      try {
        const errorJson = JSON.parse(error);
        console.log('   📋 Error details:', errorJson);
      } catch (e) {
        console.log('   📋 Raw error:', error);
      }
    }

    // Scenario 3: Update with invalid data types
    console.log('\n   Scenario 3: Update with invalid data types');
    const invalidUpdate = {
      name: testCategory.name,
      slug: testCategory.slug,
      description: testCategory.description,
      image_url: testCategory.image_url,
      icon_url: '🎮',
      parent_id: testCategory.parent_id,
      sort_order: "invalid", // Invalid sort_order
      is_active: testCategory.is_active
    };

    const invalidResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidUpdate)
    });

    if (invalidResponse.ok) {
      console.log('   ✅ Invalid data type update successful (API handled it)');
    } else {
      const error = await invalidResponse.text();
      console.log('   ❌ Invalid data type update failed:', error);
    }

    // Scenario 4: Update with duplicate slug
    console.log('\n   Scenario 4: Update with duplicate slug');
    const duplicateSlugUpdate = {
      name: testCategory.name,
      slug: 'fashion', // Use existing slug from another category
      description: testCategory.description,
      image_url: testCategory.image_url,
      icon_url: '🎯',
      parent_id: testCategory.parent_id,
      sort_order: testCategory.sort_order,
      is_active: testCategory.is_active
    };

    const duplicateResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateSlugUpdate)
    });

    if (duplicateResponse.ok) {
      console.log('   ⚠️  Duplicate slug update successful (unexpected)');
    } else {
      const error = await duplicateResponse.text();
      console.log('   ✅ Duplicate slug update correctly failed:', error);
    }

    // Step 4: Test frontend-like request
    console.log('\n4. Testing frontend-like request...');
    
    // Simulate the exact request the frontend would make
    const frontendLikeUpdate = {
      name: testCategory.name,
      slug: testCategory.slug,
      description: testCategory.description || '',
      parent_id: testCategory.parent_id || null,
      sort_order: parseInt(testCategory.sort_order.toString()),
      is_active: testCategory.is_active,
      image_url: testCategory.image_url || '',
      icon_url: '🚀' // New icon
    };

    console.log('   Frontend-like request data:', frontendLikeUpdate);

    const frontendResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frontendLikeUpdate)
    });

    if (frontendResponse.ok) {
      const result = await frontendResponse.json();
      console.log('   ✅ Frontend-like update successful:', result);
    } else {
      const error = await frontendResponse.text();
      console.log('   ❌ Frontend-like update failed:', error);
      
      // This is likely where the issue is
      console.log('\n🎯 FOUND THE ISSUE! Frontend-like request failed.');
      console.log('   This suggests the problem is in how the frontend sends the request.');
    }

    // Step 5: Check current category state
    console.log('\n5. Final category state check...');
    const finalCheck = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`);
    if (finalCheck.ok) {
      const finalCategory = await finalCheck.json();
      console.log('   Final category state:', {
        id: finalCategory.id,
        name: finalCategory.name,
        icon_url: finalCategory.icon_url
      });
    }

    // Step 6: Provide solution
    console.log('\n6. 🔧 SOLUTION RECOMMENDATIONS:');
    console.log('   Based on the tests above, here are the most likely issues:');
    console.log('   ');
    console.log('   A) Missing required fields in frontend request');
    console.log('   B) Invalid data types (especially sort_order)');
    console.log('   C) Null/undefined values not handled properly');
    console.log('   D) Frontend not sending complete category data');
    console.log('   ');
    console.log('   To fix the frontend issue:');
    console.log('   1. Ensure all required fields are included');
    console.log('   2. Convert sort_order to integer: parseInt(sort_order)');
    console.log('   3. Handle null values properly: parent_id || null');
    console.log('   4. Include all existing category data in the update');

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugCategoryUpdateIssue();