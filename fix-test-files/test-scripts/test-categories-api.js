#!/usr/bin/env node

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API...\n');
  
  try {
    // Test 1: Get all categories
    console.log('Test 1: Fetching all categories...');
    const response1 = await fetch('http://localhost:3001/api/categories');
    
    if (response1.ok) {
      const categories = await response1.json();
      console.log(`✅ SUCCESS: Found ${categories.length} categories`);
      console.log('First few categories:', categories.slice(0, 3).map(c => `${c.name} (${c.slug})`));
    } else {
      console.log(`❌ FAILED: Status ${response1.status}`);
      const error = await response1.text();
      console.log('Error:', error);
    }
    
    // Test 2: Get category by slug (electronics)
    console.log('\nTest 2: Fetching electronics category by slug...');
    const response2 = await fetch('http://localhost:3001/api/categories?slug=electronics');
    
    if (response2.ok) {
      const result = await response2.json();
      console.log('✅ SUCCESS: Electronics category found');
      console.log('Category:', result);
    } else {
      console.log(`❌ FAILED: Status ${response2.status}`);
      const error = await response2.text();
      console.log('Error:', error);
    }
    
    // Test 3: Get main categories only
    console.log('\nTest 3: Fetching main categories only...');
    const response3 = await fetch('http://localhost:3001/api/categories?parent_only=true');
    
    if (response3.ok) {
      const mainCategories = await response3.json();
      console.log(`✅ SUCCESS: Found ${mainCategories.length} main categories`);
      console.log('Main categories:', mainCategories.map(c => c.name));
    } else {
      console.log(`❌ FAILED: Status ${response3.status}`);
      const error = await response3.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testCategoriesAPI();