#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yuumpy',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function debugSamsungProduct() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Debugging Samsung Galaxy S25 Ultra product...\n');
    
    // 1. Find the Samsung Galaxy S25 Ultra product
    const [products] = await connection.execute(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             sc.name as subcategory_name, sc.slug as subcategory_slug,
             b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories sc ON p.subcategory_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.name LIKE '%Samsung Galaxy S25 Ultra%'
      ORDER BY p.updated_at DESC
    `);
    
    console.log('📱 Samsung Galaxy S25 Ultra Products Found:');
    console.log('='.repeat(60));
    
    if (products.length === 0) {
      console.log('❌ No Samsung Galaxy S25 Ultra products found!');
      return;
    }
    
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Slug: ${product.slug}`);
      console.log(`  Is Active: ${product.is_active ? '✅ Yes' : '❌ No'}`);
      console.log(`  Category: ${product.category_name} (ID: ${product.category_id}, Slug: ${product.category_slug})`);
      console.log(`  Subcategory: ${product.subcategory_name || 'None'} (ID: ${product.subcategory_id || 'None'})`);
      console.log(`  Brand: ${product.brand_name} (ID: ${product.brand_id}, Slug: ${product.brand_slug})`);
      console.log(`  Price: $${product.price}`);
      console.log(`  Created: ${product.created_at}`);
      console.log(`  Updated: ${product.updated_at}`);
      console.log(`  Featured: ${product.is_featured ? '✅ Yes' : '❌ No'}`);
      console.log(`  Bestseller: ${product.is_bestseller ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });
    
    // 2. Check Electronics category
    const [electronics] = await connection.execute(`
      SELECT * FROM categories WHERE slug = 'electronics'
    `);
    
    console.log('🏷️ Electronics Category:');
    console.log('='.repeat(40));
    if (electronics.length > 0) {
      const cat = electronics[0];
      console.log(`  ID: ${cat.id}`);
      console.log(`  Name: ${cat.name}`);
      console.log(`  Slug: ${cat.slug}`);
      console.log(`  Is Active: ${cat.is_active ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log('❌ Electronics category not found!');
    }
    
    // 3. Check Samsung brand
    const [samsung] = await connection.execute(`
      SELECT * FROM brands WHERE slug = 'samsung'
    `);
    
    console.log('\n🏢 Samsung Brand:');
    console.log('='.repeat(40));
    if (samsung.length > 0) {
      const brand = samsung[0];
      console.log(`  ID: ${brand.id}`);
      console.log(`  Name: ${brand.name}`);
      console.log(`  Slug: ${brand.slug}`);
      console.log(`  Is Active: ${brand.is_active ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log('❌ Samsung brand not found!');
    }
    
    // 4. Check what products are showing in Electronics
    const [electronicsProducts] = await connection.execute(`
      SELECT p.id, p.name, p.is_active, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE c.slug = 'electronics' AND p.is_active = 1
      ORDER BY p.updated_at DESC
    `);
    
    console.log('\n📦 All Active Products in Electronics Category:');
    console.log('='.repeat(60));
    if (electronicsProducts.length > 0) {
      electronicsProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product.id}) - Brand: ${product.brand_name}`);
      });
    } else {
      console.log('❌ No active products found in Electronics category!');
    }
    
    // 5. Check recent product updates
    const [recentUpdates] = await connection.execute(`
      SELECT p.id, p.name, p.updated_at, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY p.updated_at DESC
    `);
    
    console.log('\n🕐 Recent Product Updates (Last Hour):');
    console.log('='.repeat(60));
    if (recentUpdates.length > 0) {
      recentUpdates.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.category_name} - Updated: ${product.updated_at}`);
      });
    } else {
      console.log('ℹ️ No products updated in the last hour');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugSamsungProduct();