#!/usr/bin/env node

// Simple check for Samsung Galaxy S25 Ultra product
async function checkSamsungS25() {
  try {
    console.log('🔍 Checking Samsung Galaxy S25 Ultra product...\n');
    
    // Check via API
    const response = await fetch('http://localhost:3000/api/products?category=electronics&admin=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('📦 Electronics Products Found:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      console.log('\n📱 Products in Electronics:');
      console.log('='.repeat(50));
      
      data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Slug: ${product.slug}`);
        console.log(`   Active: ${product.is_active ? '✅' : '❌'}`);
        console.log(`   Category ID: ${product.category_id}`);
        console.log(`   Brand: ${product.brand_name || 'Unknown'}`);
        console.log(`   Updated: ${product.updated_at}`);
        console.log('');
      });
      
      // Look specifically for Samsung Galaxy S25 Ultra
      const samsungS25 = data.products.find(p => 
        p.name.toLowerCase().includes('samsung') && 
        p.name.toLowerCase().includes('galaxy') && 
        p.name.toLowerCase().includes('s25')
      );
      
      if (samsungS25) {
        console.log('✅ Samsung Galaxy S25 Ultra FOUND in Electronics!');
        console.log('Details:', JSON.stringify(samsungS25, null, 2));
      } else {
        console.log('❌ Samsung Galaxy S25 Ultra NOT FOUND in Electronics!');
        
        // Check if it exists anywhere
        const allResponse = await fetch('http://localhost:3000/api/products?admin=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const samsungAnywhere = allData.products?.find(p => 
            p.name.toLowerCase().includes('samsung') && 
            p.name.toLowerCase().includes('galaxy') && 
            p.name.toLowerCase().includes('s25')
          );
          
          if (samsungAnywhere) {
            console.log('🔍 Found Samsung Galaxy S25 Ultra in different category:');
            console.log('Category ID:', samsungAnywhere.category_id);
            console.log('Category Name:', samsungAnywhere.category_name);
            console.log('Is Active:', samsungAnywhere.is_active);
            console.log('Full Details:', JSON.stringify(samsungAnywhere, null, 2));
          } else {
            console.log('❌ Samsung Galaxy S25 Ultra not found anywhere!');
          }
        }
      }
    } else {
      console.log('❌ No products found in Electronics category!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSamsungS25();