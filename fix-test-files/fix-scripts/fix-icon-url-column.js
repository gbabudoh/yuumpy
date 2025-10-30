async function fixIconUrlColumn() {
    try {
        console.log('🔧 Fixing icon_url column size issue\n');

        // First, let's check what's causing the issue
        console.log('1. Checking current categories and their icon_url lengths...');

        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        const categories = await categoriesResponse.json();

        categories.forEach(cat => {
            const iconLength = cat.icon_url ? cat.icon_url.length : 0;
            console.log(`   ${cat.name}: "${cat.icon_url}" (${iconLength} chars)`);
        });

        // The issue is likely that someone tried to upload an image file as base64
        // which creates a very long string (thousands of characters)
        // But the database column is probably VARCHAR(255) or similar

        console.log('\n2. 🎯 ISSUE IDENTIFIED:');
        console.log('   The icon_url database column is too small for base64 image data');
        console.log('   Base64 images can be 10,000+ characters long');
        console.log('   But the database column is likely VARCHAR(255) or similar');

        console.log('\n3. 🔧 SOLUTIONS:');
        console.log('   A) Use only emoji icons (recommended)');
        console.log('   B) Use external image URLs');
        console.log('   C) Increase database column size');

        // Let's test with a proper emoji icon
        console.log('\n4. Testing with emoji icon (safe approach)...');

        const testCategory = categories.find(c => c.id === 37); // Beauty & Personal Care
        if (testCategory) {
            console.log(`   Testing update of category: ${testCategory.name}`);

            const updateData = {
                name: testCategory.name,
                slug: testCategory.slug,
                description: testCategory.description || '',
                image_url: testCategory.image_url || '',
                icon_url: '💄', // Safe emoji icon
                parent_id: testCategory.parent_id,
                sort_order: parseInt(testCategory.sort_order?.toString() || '0'),
                is_active: Boolean(testCategory.is_active)
            };

            const updateResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('   ✅ Emoji icon update successful:', result);
            } else {
                const error = await updateResponse.text();
                console.error('   ❌ Even emoji update failed:', error);
            }
        }

        console.log('\n5. 📋 IMMEDIATE FIX FOR FRONTEND:');
        console.log('   Prevent base64 image uploads for icons');
        console.log('   Only allow emoji selection or external URLs');
        console.log('   Add validation to check icon_url length');

    } catch (error) {
        console.error('❌ Error in fix script:', error);
    }
}

fixIconUrlColumn();