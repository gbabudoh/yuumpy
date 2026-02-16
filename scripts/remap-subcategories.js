import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function remapSubcategories() {
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

        // Re-map subcategories with category_id 44 to ID 1 (Home & Garden - Candles)
        const [result] = await connection.query(
            'UPDATE subcategories SET category_id = 1 WHERE category_id = 44'
        );

        console.log(`Re-mapped ${result.changedRows} subcategories to category ID 1.`);

    } catch (error) {
        console.error('Error re-mapping subcategories:', error);
    } finally {
        if (connection) await connection.end();
    }
}

remapSubcategories();
