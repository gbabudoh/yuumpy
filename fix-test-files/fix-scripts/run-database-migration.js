async function runDatabaseMigration() {
  try {
    console.log('🔧 Running Database Migration for Icon Upload Fix\n');

    // First check current status
    console.log('1. Checking current database schema...');
    const checkResponse = await fetch('http://localhost:3000/api/admin/migrate-database');
    
    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log('Current column info:', checkResult);
      
      if (!checkResult.needsMigration) {
        console.log('✅ Migration not needed - column already supports large data');
        return;
      }
    }

    // Run the migration
    console.log('\n2. Running database migration...');
    const migrateResponse = await fetch('http://localhost:3000/api/admin/migrate-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (migrateResponse.ok) {
      const result = await migrateResponse.json();
      console.log('✅ Migration successful:', result);
      
      console.log('\n3. 🎉 MIGRATION COMPLETED!');
      console.log('   Before:', result.before);
      console.log('   After:', result.after);
      console.log('   The icon_url column now supports much larger data');
      
    } else {
      const error = await migrateResponse.text();
      console.error('❌ Migration failed:', error);
      
      console.log('\n🔧 MANUAL MIGRATION REQUIRED:');
      console.log('   Please run this SQL command manually:');
      console.log('   ALTER TABLE categories MODIFY COLUMN icon_url TEXT;');
    }

    // Test with a larger string after migration
    console.log('\n4. Testing with larger icon data...');
    const testString = 'data:image/png;base64,' + 'A'.repeat(5000); // Simulate 5KB base64
    console.log('   Test string length:', testString.length, 'characters');

    const testResponse = await fetch('http://localhost:3000/api/categories/53', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gadgets',
        slug: 'gadgets',
        description: 'Tech gadgets, accessories, innovative products',
        image_url: '',
        icon_url: testString,
        parent_id: null,
        sort_order: 11,
        is_active: true
      })
    });

    if (testResponse.ok) {
      console.log('✅ Large icon data test successful!');
      
      // Reset back to emoji
      await fetch('http://localhost:3000/api/categories/53', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Gadgets',
          slug: 'gadgets',
          description: 'Tech gadgets, accessories, innovative products',
          image_url: '',
          icon_url: '⚡',
          parent_id: null,
          sort_order: 11,
          is_active: true
        })
      });
      
      console.log('\n🎯 PROBLEM SOLVED!');
      console.log('   • Database now supports base64 images');
      console.log('   • Icon uploads should work properly');
      console.log('   • 5723 character images will be accepted');
      
    } else {
      const testError = await testResponse.text();
      console.error('❌ Large icon test still failed:', testError);
    }

  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

runDatabaseMigration();