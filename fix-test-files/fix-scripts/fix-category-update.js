async function fixCategoryUpdate() {
  try {
    console.log('Category Update Fix Tool\n');
    console.log('This tool will help diagnose and fix category update issues.\n');

    // Step 1: Check all categories
    console.log('1. Checking current categories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    if (!categoriesResponse.ok) {
      console.error('❌ Failed to fetch categories. Server might be down.');
      return;
    }

    const categories = await categoriesResponse.json();
    console.log(`✅ Found ${categories.length} categories`);
    
    // Display categories with their current icons
    console.log('\nCurrent categories and icons:');
    categories.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.name} - ${cat.icon_url || '(no icon)'} - Slug: ${cat.slug}`);
    });

    // Step 2: Test update function
    console.log('\n2. Testing category update function...');
    
    // Function to safely update a category
    async function updateCategory(categoryId, updates) {
      try {
        // First get the current category data
        const getCurrentResponse = await fetch(`http://localhost:3000/api/categories/${categoryId}`);
        if (!getCurrentResponse.ok) {
          throw new Error(`Failed to get category ${categoryId}: ${getCurrentResponse.status}`);
        }

        const currentCategory = await getCurrentResponse.json();
        console.log(`   Current data for category ${categoryId}:`, {
          name: currentCategory.name,
          slug: currentCategory.slug,
          icon_url: currentCategory.icon_url
        });

        // Merge current data with updates
        const updateData = {
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description,
          image_url: currentCategory.image_url,
          icon_url: currentCategory.icon_url,
          parent_id: currentCategory.parent_id,
          sort_order: currentCategory.sort_order,
          is_active: currentCategory.is_active,
          ...updates // Override with new values
        };

        console.log(`   Updating category ${categoryId} with:`, updates);

        const updateResponse = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log(`   ✅ Successfully updated category ${categoryId}`);
          return { success: true, result };
        } else {
          const errorText = await updateResponse.text();
          let errorDetails;
          try {
            errorDetails = JSON.parse(errorText);
          } catch (e) {
            errorDetails = { error: errorText };
          }
          console.error(`   ❌ Failed to update category ${categoryId}:`, errorDetails);
          return { success: false, error: errorDetails };
        }
      } catch (error) {
        console.error(`   ❌ Error updating category ${categoryId}:`, error.message);
        return { success: false, error: error.message };
      }
    }

    // Step 3: Example updates - you can modify these
    console.log('\n3. Example category updates:');
    
    // Example 1: Update Electronics icon back to smartphone
    const electronicsUpdate = await updateCategory(44, {
      icon_url: '📱'
    });

    // Example 2: Update Fashion icon
    const fashionCategory = categories.find(c => c.slug === 'fashion');
    if (fashionCategory) {
      const fashionUpdate = await updateCategory(fashionCategory.id, {
        icon_url: '👕'
      });
    }

    // Step 4: Verify updates
    console.log('\n4. Verifying updates...');
    const verifyResponse = await fetch('http://localhost:3000/api/categories');
    if (verifyResponse.ok) {
      const updatedCategories = await verifyResponse.json();
      console.log('\nUpdated categories:');
      updatedCategories.forEach(cat => {
        const oldCat = categories.find(c => c.id === cat.id);
        if (oldCat && oldCat.icon_url !== cat.icon_url) {
          console.log(`   ✅ ${cat.name}: ${oldCat.icon_url || '(none)'} → ${cat.icon_url || '(none)'}`);
        }
      });
    }

    // Step 5: Common troubleshooting tips
    console.log('\n5. Troubleshooting Tips:');
    console.log('   • Make sure all required fields (name, slug) are provided');
    console.log('   • Ensure slug is unique across all categories');
    console.log('   • Check that category ID exists');
    console.log('   • Verify server is running and database is connected');
    console.log('   • Use emoji icons (🔌, 📱, 💻, etc.) for best compatibility');

    // Step 6: Provide update template
    console.log('\n6. Update Template:');
    console.log(`
// To update a category icon, use this format:
const updateResult = await fetch('http://localhost:3000/api/categories/CATEGORY_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Category Name',
    slug: 'category-slug',
    description: 'Category description',
    image_url: null,
    icon_url: '🔌', // New icon here
    parent_id: null,
    sort_order: 0,
    is_active: true
  })
});
    `);

  } catch (error) {
    console.error('❌ Error in fix tool:', error);
  }
}

fixCategoryUpdate();