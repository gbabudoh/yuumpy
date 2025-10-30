async function checkSubcategories() {
  try {
    console.log('Checking all categories and subcategories...\n');

    const response = await fetch('http://localhost:3000/api/categories');
    if (response.ok) {
      const categories = await response.json();
      
      console.log('All categories:');
      categories.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id || 'None'}`);
      });

      console.log('\nElectronics-related categories:');
      const electronics = categories.filter(c => 
        c.name.toLowerCase().includes('electronic') || 
        c.slug.includes('electronic') ||
        c.id === 44
      );
      electronics.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id || 'None'}`);
      });

      console.log('\nSmartphone-related categories:');
      const smartphones = categories.filter(c => 
        c.name.toLowerCase().includes('smartphone') || 
        c.slug.includes('smartphone')
      );
      smartphones.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id || 'None'}`);
      });

      console.log('\nCategories with parent_id 44 (Electronics subcategories):');
      const electronicsSubcats = categories.filter(c => c.parent_id === 44);
      electronicsSubcats.forEach(cat => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Parent: ${cat.parent_id}`);
      });

    }
  } catch (error) {
    console.error('Error checking subcategories:', error);
  }
}

checkSubcategories();