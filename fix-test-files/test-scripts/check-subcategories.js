#!/usr/bin/env node

async function checkSubcategories() {
  try {
    console.log('📂 Checking subcategories...\n');
    
    const response = await fetch('http://localhost:3000/api/subcategories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status);
      return;
    }
    
    const subcategories = await response.json();
    
    console.log('📂 All Subcategories:');
    console.log('='.repeat(60));
    
    subcategories.forEach(sub => {
      console.log(`ID: ${sub.id} | Name: ${sub.name} | Slug: ${sub.slug} | Parent Category: ${sub.category_id}`);
    });
    
    // Find Electronics subcategories
    const electronicsSubcats = subcategories.filter(s => s.category_id === 44);
    
    console.log('\n🔍 Electronics Subcategories:');
    console.log('='.repeat(40));
    electronicsSubcats.forEach(sub => {
      console.log(`ID: ${sub.id} | Name: ${sub.name} | Slug: ${sub.slug}`);
    });
    
    // Find Smartphones subcategory
    const smartphones = subcategories.find(s => s.slug === 'smartphones');
    console.log('\n📱 Smartphones subcategory:', smartphones ? `ID: ${smartphones.id}, Parent: ${smartphones.category_id}` : 'Not found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSubcategories();