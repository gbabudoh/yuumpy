const mysql = require('mysql2/promise');

async function fixDatabaseColumn() {
  let connection;
  
  try {
    console.log('🔧 Fixing Database Column for Icon Uploads\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'yuumpy'
    });

    console.log('✅ Connected to database');

    // Check current column structure
    console.log('\n1. Checking current column structure...');
    const [columnInfo] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'yuumpy' 
      AND TABLE_NAME = 'categories' 
      AND COLUMN_NAME = 'icon_url'
    `);

    if (columnInfo.length === 0) {
      console.error('❌ Column icon_url not found');
      return;
    }

    const currentColumn = columnInfo[0];
    console.log('Current column:', {
      type: currentColumn.DATA_TYPE,
      maxLength: currentColumn.CHARACTER_MAXIMUM_LENGTH
    });

    // Run the migration
    console.log('\n2. Running migration...');
    console.log('   Executing: ALTER TABLE categories MODIFY COLUMN icon_url TEXT;');
    
    await connection.execute('ALTER TABLE categories MODIFY COLUMN icon_url TEXT');
    console.log('✅ Migration executed successfully');

    // Verify the migration
    console.log('\n3. Verifying migration...');
    const [newColumnInfo] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'yuumpy' 
      AND TABLE_NAME = 'categories' 
      AND COLUMN_NAME = 'icon_url'
    `);

    const newColumn = newColumnInfo[0];
    console.log('New column:', {
      type: newColumn.DATA_TYPE,
      maxLength: newColumn.CHARACTER_MAXIMUM_LENGTH
    });

    console.log('\n🎉 DATABASE MIGRATION COMPLETED!');
    console.log('   • Column type changed from VARCHAR(500) to TEXT');
    console.log('   • Now supports up to 65,535 characters');
    console.log('   • Base64 images up to ~50KB will work');
    console.log('   • Your 5723 character image will now be accepted');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 DATABASE CONNECTION FAILED:');
      console.log('   • Make sure MySQL is running');
      console.log('   • Check database credentials');
      console.log('   • Verify database name is "yuumpy"');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 ACCESS DENIED:');
      console.log('   • Check MySQL username/password');
      console.log('   • Make sure user has ALTER privileges');
    } else {
      console.log('\n🔧 MANUAL MIGRATION REQUIRED:');
      console.log('   Please run this SQL command manually in your MySQL client:');
      console.log('   ALTER TABLE categories MODIFY COLUMN icon_url TEXT;');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

fixDatabaseColumn();