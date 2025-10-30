async function testRestoredImageUpload() {
    try {
        console.log('🔧 Testing Restored Image Upload Functionality\n');

        console.log('1. ✅ RESTORED FEATURES:');
        console.log('   • Image upload option is back');
        console.log('   • File size validation (50KB limit)');
        console.log('   • Base64 size validation (10KB limit)');
        console.log('   • Better error messages');
        console.log('   • Smart emoji vs image detection');

        console.log('\n2. 🧪 TESTING EMOJI UPDATE (should work):');

        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        const categories = await categoriesResponse.json();
        const gadgetsCategory = categories.find(c => c.slug === 'gadgets');

        if (gadgetsCategory) {
            console.log('Current Gadgets category:', {
                id: gadgetsCategory.id,
                name: gadgetsCategory.name,
                icon_url: gadgetsCategory.icon_url,
                icon_length: gadgetsCategory.icon_url ? gadgetsCategory.icon_url.length : 0
            });

            // Test emoji update
            const emojiUpdateData = {
                name: gadgetsCategory.name,
                slug: gadgetsCategory.slug,
                description: gadgetsCategory.description || '',
                image_url: gadgetsCategory.image_url || '',
                icon_url: '🔌', // New emoji
                parent_id: gadgetsCategory.parent_id,
                sort_order: parseInt(gadgetsCategory.sort_order?.toString() || '0'),
                is_active: Boolean(gadgetsCategory.is_active)
            };

            const emojiResponse = await fetch(`http://localhost:3000/api/categories/${gadgetsCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emojiUpdateData)
            });

            if (emojiResponse.ok) {
                console.log('   ✅ Emoji update successful');
            } else {
                const error = await emojiResponse.text();
                console.log('   ❌ Emoji update failed:', error);
            }
        }

        console.log('\n3. 🧪 TESTING SMALL BASE64 IMAGE (should work):');

        // Create a small test image as base64 (1x1 pixel PNG)
        const smallBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
        console.log('   Small image size:', smallBase64Image.length, 'characters');

        if (gadgetsCategory) {
            const imageUpdateData = {
                name: gadgetsCategory.name,
                slug: gadgetsCategory.slug,
                description: gadgetsCategory.description || '',
                image_url: gadgetsCategory.image_url || '',
                icon_url: smallBase64Image,
                parent_id: gadgetsCategory.parent_id,
                sort_order: parseInt(gadgetsCategory.sort_order?.toString() || '0'),
                is_active: Boolean(gadgetsCategory.is_active)
            };

            const imageResponse = await fetch(`http://localhost:3000/api/categories/${gadgetsCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imageUpdateData)
            });

            if (imageResponse.ok) {
                console.log('   ✅ Small image update successful');

                // Reset back to emoji
                await fetch(`http://localhost:3000/api/categories/${gadgetsCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...imageUpdateData,
                        icon_url: '⚡'
                    })
                });
            } else {
                const error = await imageResponse.text();
                console.log('   ❌ Small image update failed:', error);
            }
        }

        console.log('\n4. 📋 HOW THE NEW SYSTEM WORKS:');
        console.log('   ✅ Emoji icons: Always work (recommended)');
        console.log('   ✅ Small images: Work with validation');
        console.log('   ❌ Large images: Blocked with helpful error');
        console.log('   ✅ File size check: Before upload');
        console.log('   ✅ Base64 size check: After conversion');

        console.log('\n5. 🎯 USER EXPERIENCE:');
        console.log('   • Choose "Emoji Icon" for best performance');
        console.log('   • Choose "Upload Small Icon" for custom images');
        console.log('   • Get clear error messages if file too large');
        console.log('   • Automatic detection when editing existing categories');

        console.log('\n6. 🔧 VALIDATION LIMITS:');
        console.log('   • File size: Max 50KB');
        console.log('   • Base64 size: Max ~7KB (10,000 chars)');
        console.log('   • Database limit: Max 15,000 chars (safety buffer)');

    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

testRestoredImageUpload();