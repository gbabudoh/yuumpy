const fs = require('fs');

async function addSamsungS25() {
  try {
    // Read the Samsung S25 product data
    const productData = JSON.parse(fs.readFileSync('fix-samsung-s25.json', 'utf8'));
    
    // Add the product via API
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: productData.short_description,
        short_description: productData.short_description,
        price: productData.price,
        affiliate_url: productData.affiliate_url,
        category_id: productData.category_id,
        subcategory_id: productData.subcategory_id,
        brand_id: productData.brand_id,
        is_featured: productData.is_featured,
        is_bestseller: productData.is_bestseller,
        is_active: productData.is_active
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Samsung Galaxy S25 Ultra added successfully!');
      console.log('Product ID:', result.product.id);
      console.log('Product Name:', result.product.name);
      console.log('Price: £' + result.product.price);
    } else {
      const error = await response.json();
      console.error('Failed to add product:', error);
    }
  } catch (error) {
    console.error('Error adding Samsung S25:', error);
  }
}

addSamsungS25();