#!/usr/bin/env node

async function checkCategories() {
  try {
    console.log('🏷️ Checking category structure...\n');
    
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status);
      return;
    }
    
    const categories = await response.json();
    
    console.log('📂 All Categories:');
    console.log('='.repeat(50));
    
    categories.forEach(cat => {
      console.log(`ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug} | Parent: ${cat.parent_id || 'None'}`);
    });
    
    // Find Electronics and Smartphones
    const electronics = categories.find(c => c.slug === 'electronics');
    const smartphones = categories.find(c => c.slug === 'smartphones');
    
    console.log('\n🔍 Key Categories:');
    console.log('Electronics:', electronics ? `ID: ${electronics.id}, Parent: ${electronics.parent_id}` : 'Not found');
    console.log('Smartphones:', smartphones ? `ID: ${smartphones.id}, Parent: ${smartphones.parent_id}` : 'Not found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCategories();