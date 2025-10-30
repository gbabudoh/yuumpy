async function testFrontendCategoryUpdate() {
  try {
    console.log('🧪 Testing Frontend Category Update Process\n');

    // Step 1: Get a category to test with
    console.log('1. Getting Electronics category for testing...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    const electronicsCategory = categories.find(c => c.slug === 'electronics');
    
    if (!electronicsCategory) {
      console.error('❌ Electronics category not found');
      return;
    }

    console.log('✅ Found Electronics category:', {
      id: electronicsCategory.id,
      name: electronicsCategory.name,
      slug: electronicsCategory.slug,
      icon_url: electronicsCategory.icon_url,
      sort_order: electronicsCategory.sort_order,
      parent_id: electronicsCategory.parent_id
    });

    // Step 2: Test slug generation (this might be causing issues)
    console.log('\n2. Testing slug generation...');
    const slugCheckResponse = await fetch(`http://localhost:3000/api/categories/check-slug?slug=electronics&exclude=${electronicsCategory.id}`);
    
    if (slugCheckResponse.ok) {
      const slugResult = await slugCheckResponse.json();
      console.log('✅ Slug check result:', slugResult);
    } else {
      const slugError = await slugCheckResponse.text();
      console.error('❌ Slug check failed:', slugError);
    }

    // Step 3: Simulate the exact frontend request
    console.log('\n3. Simulating exact frontend request...');
    
    // This simulates what the frontend form would send
    const frontendFormData = {
      name: electronicsCategory.name,
      slug: electronicsCategory.slug,
      description: electronicsCategory.description || '',
      parent_id: electronicsCategory.parent_id?.toString() || '',
      sort_order: electronicsCategory.sort_order || 0,
      is_active: electronicsCategory.is_active
    };

    console.log('Frontend form data:', frontendFormData);

    // Simulate the frontend's slug generation process
    async function generateUniqueSlug(baseSlug, excludeId) {
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const response = await fetch(`http://localhost:3000/api/categories/check-slug?slug=${slug}${excludeId ? `&exclude=${excludeId}` : ''}`);
        const data = await response.json();
        
        if (!data.exists) {
          return slug;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const uniqueSlug = await generateUniqueSlug(frontendFormData.slug, electronicsCategory.id);
    console.log('Generated unique slug:', uniqueSlug);

    // Prepare the request body exactly like the frontend does
    const requestBody = {
      name: frontendFormData.name,
      slug: uniqueSlug,
      description: frontendFormData.description || '',
      image_url: electronicsCategory.image_url || '',
      icon_url: '🔥', // New icon to test
      parent_id: frontendFormData.parent_id ? parseInt(frontendFormData.parent_id) : null,
      sort_order: parseInt(frontendFormData.sort_order?.toString() || '0'),
      is_active: Boolean(frontendFormData.is_active)
    };

    console.log('Request body to send:', requestBody);

    // Step 4: Make the actual update request
    console.log('\n4. Making update request...');
    const updateResponse = await fetch(`http://localhost:3000/api/categories/${electronicsCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', updateResponse.status);
    console.log('Response headers:', Object.fromEntries(updateResponse.headers.entries()));

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Update successful:', result);
    } else {
      console.log('❌ Update failed');
      
      // Try to get the response text first
      const responseText = await updateResponse.text();
      console.log('Raw response text:', responseText);
      
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          console.log('Parsed error data:', errorData);
        } catch (parseError) {
          console.log('Failed to parse as JSON, raw text:', responseText);
        }
      } else {
        console.log('Empty response body');
      }
    }

    // Step 5: Check server logs for any errors
    console.log('\n5. 🔍 DEBUGGING TIPS:');
    console.log('   • Check the server console for any database errors');
    console.log('   • Verify all required fields are present');
    console.log('   • Check if the category ID exists');
    console.log('   • Ensure the database connection is working');
    console.log('   • Look for any middleware that might be interfering');

    // Step 6: Verify current state
    console.log('\n6. Verifying current category state...');
    const verifyResponse = await fetch(`http://localhost:3000/api/categories/${electronicsCategory.id}`);
    if (verifyResponse.ok) {
      const currentState = await verifyResponse.json();
      console.log('Current category state:', {
        id: currentState.id,
        name: currentState.name,
        icon_url: currentState.icon_url
      });
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testFrontendCategoryUpdate();