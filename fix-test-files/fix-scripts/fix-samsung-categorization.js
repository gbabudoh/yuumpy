#!/usr/bin/env node

async function fixSamsungCategorization() {
  try {
    console.log('🔧 Fixing Samsung Galaxy S25 Ultra categorization...\n');
    
    // Update the product via API
    const updateData = {
      category_id: 44,      // Electronics (main category)
      subcategory_id: 45    // Smartphones (subcategory under Electronics)
    };
    
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
        category_id: 44,      // Electronics (main category)
        subcategory_id: 45,   // Smartphones (subcategory)
        brand_id: 2,          // Samsung
        is_featured: true,
        is_bestseller: true,
        is_active: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Samsung Galaxy S25 Ultra categorization fixed!');
      console.log('Result:', result);
      
      // Verify the fix
      console.log('\n🔍 Verifying fix...');
      const verifyResponse = await fetch('http://localhost:3000/api/products?category=electronics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const samsungFound = verifyData.products?.find(p => 
          p.name.toLowerCase().includes('samsung') && 
          p.name.toLowerCase().includes('galaxy') && 
          p.name.toLowerCase().includes('s25')
        );
        
        if (samsungFound) {
          console.log('✅ SUCCESS: Samsung Galaxy S25 Ultra now appears in Electronics!');
          console.log('Category ID:', samsungFound.category_id);
          console.log('Subcategory ID:', samsungFound.subcategory_id);
        } else {
          console.log('❌ Samsung Galaxy S25 Ultra still not found in Electronics');
        }
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Update failed:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSamsungCategorization();