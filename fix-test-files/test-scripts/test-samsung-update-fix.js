#!/usr/bin/env node

async function testSamsungUpdateFix() {
  console.log('🧪 Testing Samsung Galaxy S25 Ultra update fix...\n');
  
  try {
    // Test the correct update with proper category assignment
    console.log('Testing product update with correct categorization...');
    const response = await fetch('http://localhost:3000/api/products/samsung-galaxy-s25-ultra-ai-smartphone-galaxy-ai', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Samsung Galaxy S25 Ultra AI Smartphone, Galaxy AI",
        slug: "samsung-galaxy-s25-ultra-ai-smartphone-galaxy-ai",
        description: "Samsung Galaxy S25 Ultra AI Smartphone, Galaxy AI, 12GB Memory, 512GB Storage, 200MP Camera, S Pen Included, 3 Year Manufacturer Extended Warranty (UK Version) come in various colours: Titanium Gray, Titanium Silverblue, Titanium Whitesilver, Titanium Black - 256GB, 512GB, 1TB",
        short_description: "Samsung Galaxy S25 Ultra AI Smartphone, Galaxy AI, 12GB Memory, 512GB Storage, 200MP Camera, S Pen Included, 3 Year Manufacturer Extended Warranty (UK Version) come in various colours: Titanium Gray, Titanium Silverblue, Titanium Whitesilver, Titanium Black - 256GB, 512GB, 1TB",
        price: "1099.00",
        original_price: "1200.00",
        affiliate_url: "https://amzn.to/48Tn5yv",
        image_url: "https://res.cloudinary.com/ddvupyjir/image/upload/v1761792728/yuumpy/products/1761792727515_samsung-galaxy-s25-.jpg.jpg",
        category_id: 44,      // Electronics (main category) - CORRECT
        subcategory_id: 45,   // Smartphones (subcategory) - CORRECT
        brand_id: 2,          // Samsung
        is_featured: true,
        is_bestseller: true,
        is_active: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: Product update accepted!');
      console.log('Message:', result.message);
      if (result.categorization) {
        console.log('Final categorization:', result.categorization);
      }
      
      // Verify it appears in Electronics
      console.log('\n🔍 Verifying product appears in Electronics...');
      const verifyResponse = await fetch('http://localhost:3000/api/products?category=electronics');
      
      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        const samsungFound = data.products?.find(p => 
          p.name.toLowerCase().includes('samsung') && 
          p.name.toLowerCase().includes('galaxy') && 
          p.name.toLowerCase().includes('s25')
        );
        
        if (samsungFound) {
          console.log('✅ CONFIRMED: Samsung Galaxy S25 Ultra found in Electronics!');
          console.log(`   Category: ${samsungFound.category_name} (ID: ${samsungFound.category_id})`);
          console.log(`   Subcategory: ${samsungFound.subcategory_name || 'None'} (ID: ${samsungFound.subcategory_id || 'None'})`);
        } else {
          console.log('❌ ERROR: Samsung Galaxy S25 Ultra not found in Electronics');
        }
      }
      
    } else {
      const error = await response.json();
      console.log('❌ FAILED: Product update rejected');
      console.log('Status:', response.status);
      console.log('Error:', error.error);
      console.log('Suggestion:', error.suggestion);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testSamsungUpdateFix();