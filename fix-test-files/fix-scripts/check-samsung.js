const mysql = require('mysql2/promise');

async function checkSamsung() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'yuumpy'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id, name, price, is_active FROM products WHERE name LIKE ? ORDER BY id DESC',
      ['%Samsung%Galaxy%S25%']
    );
    
    console.log('Samsung Galaxy S25 products:');
    console.log(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkSamsung();