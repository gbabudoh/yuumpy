async function testCategoryUpdate() {
  try {
    console.log('Testing category update functionality...\n');

    // First, get all categories to see current state
    console.log('1. Current categories:');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('Available categories:');
      categories.forEach(cat => {
        console.log(`- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Icon: ${cat.icon_url || 'None'}`);
      });

      // Test updating the Electronics category icon
      const electronicsCategory = categories.find(c => c.slug === 'electronics');
      if (electronicsCategory) {
        console.log(`\n2. Testing update of Electronics category (ID: ${electronicsCategory.id}):`);
        console.log('Current icon:', electronicsCategory.icon_url);
        
        // Try to update the icon
        const updateData = {
          name: electronicsCategory.name,
          slug: electronicsCategory.slug,
          description: electronicsCategory.description,
          image_url: electronicsCategory.image_url,
          icon_url: '🔌', // New icon
          parent_id: electronicsCategory.parent_id,
          sort_order: electronicsCategory.sort_order,
          is_active: electronicsCategory.is_active
        };

        console.log('Updating with data:', updateData);

        const updateResponse = await fetch(`http://localhost:3000/api/categories/${electronicsCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('✅ Update successful:', result);
          
          // Verify the update
          console.log('\n3. Verifying update:');
          const verifyResponse = await fetch(`http://localhost:3000/api/categories/${electronicsCategory.id}`);
          if (verifyResponse.ok) {
            const updatedCategory = await verifyResponse.json();
            console.log('Updated category:', {
              id: updatedCategory.id,
              name: updatedCategory.name,
              icon_url: updatedCategory.icon_url
            });
          }
        } else {
          const error = await updateResponse.text();
          console.error('❌ Update failed:', error);
          
          // Try to parse as JSON for better error details
          try {
            const errorJson = JSON.parse(error);
            console.error('Error details:', errorJson);
          } catch (e) {
            console.error('Raw error response:', error);
          }
        }
      } else {
        console.log('Electronics category not found');
      }
    } else {
      console.error('Failed to fetch categories');
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testCategoryUpdate();