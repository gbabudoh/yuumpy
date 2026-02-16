import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const categories = [
    { name: 'Candles, Aromatherapy, Home & Garden', icon: '🕯️', slug: 'home-garden' }, // Mapping to existing slug 'home-garden'
    { name: 'Cookware, Tableware, and Kitchen Gadgets', icon: '🍳', slug: 'kitchen-gadgets' },
    { name: 'Plants, Tools, and Outdoor Decor.', icon: '🪴', slug: 'outdoor-decor' },
    { name: 'Accessories, Grooming, and Pet Wellness', icon: '🐕', slug: 'pet-wellness' },
    { name: 'Fragrance, Beauty & Care, Bath & Body', icon: '🧴', slug: 'beauty-care' },
    { name: 'Aromatherapy (cross-listed), Mental Wellbeing, and Relaxation tools', icon: '🧘', slug: 'wellness' },
    { name: 'Tea', icon: '🍵', slug: 'tea' },
    { name: 'Jewellery', icon: '💍', slug: 'jewellery' },
    { name: 'Bags', icon: '👜', slug: 'bags' },
    { name: 'Wearables', icon: '⌚', slug: 'wearables' },
    { name: 'Gifts', icon: '🎁', slug: 'gifts' }, // Mapping to existing slug 'gifts'
    { name: 'Licensed & Collections', icon: '🎭', slug: 'licensed-collections' },
    { name: 'Souvenirs', icon: '🏺', slug: 'souvenirs' }
];

async function updateCategories() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT)
        });

        console.log('Connected to database.');

        for (const cat of categories) {
            console.log(`Processing category: ${cat.name}`);
            
            // Check if exists by name or slug
            const [existing] = await connection.query(
                'SELECT id FROM categories WHERE name = ? OR slug = ?',
                [cat.name, cat.slug]
            );

            if (existing.length > 0) {
                // Update
                await connection.query(
                    'UPDATE categories SET name = ?, icon_url = ?, is_active = 1 WHERE id = ?',
                    [cat.name, cat.icon, existing[0].id]
                );
                console.log(`Updated category ID ${existing[0].id}`);
            } else {
                // Insert
                await connection.query(
                    'INSERT INTO categories (name, slug, icon_url, is_active) VALUES (?, ?, ?, 1)',
                    [cat.name, cat.slug, cat.icon]
                );
                console.log(`Inserted category: ${cat.name}`);
            }
        }

        console.log('Category update complete.');
    } catch (error) {
        console.error('Error updating categories:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateCategories();
