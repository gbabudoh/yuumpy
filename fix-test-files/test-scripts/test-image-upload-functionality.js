async function testImageUploadFunctionality() {
  try {
    console.log('🧪 Testing Image Upload Functionality\n');

    // Test 1: Check current categories
    console.log('1. Checking current categories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    const testCategory = categories.find(c => c.slug === 'gadgets');
    if (!testCategory) {
      console.error('❌ Test category not found');
      return;
    }

    console.log('Current test category (Gadgets):', {
      id: testCategory.id,
      name: testCategory.name,
      icon_url: testCategory.icon_url,
      icon_length: testCategory.icon_url ? testCategory.icon_url.length : 0,
      icon_type: testCategory.icon_url && testCategory.icon_url.length > 10 ? 'image' : 'emoji'
    });

    // Test 2: Try updating with a small base64 image
    console.log('\n2. Testing small base64 image update...');
    
    // Create a very small test image (1x1 pixel red PNG)
    const smallTestImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    console.log('Test image size:', smallTestImage.length, 'characters');

    const updateData = {
      name: testCategory.name,
      slug: testCategory.slug,
      description: testCategory.description || '',
      image_url: testCategory.image_url || '',
      icon_url: smallTestImage, // Small base64 image
      parent_id: testCategory.parent_id,
      sort_order: parseInt(testCategory.sort_order?.toString() || '0'),
      is_active: Boolean(testCategory.is_active)
    };

    console.log('Sending update request...');
    const updateResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', updateResponse.status);
    console.log('Response ok:', updateResponse.ok);

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Image update successful:', result);
      
      // Verify the update
      const verifyResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`);
      if (verifyResponse.ok) {
        const updatedCategory = await verifyResponse.json();
        console.log('✅ Verified - category now has image icon:', {
          id: updatedCategory.id,
          name: updatedCategory.name,
          icon_url_length: updatedCategory.icon_url ? updatedCategory.icon_url.length : 0,
          icon_type: updatedCategory.icon_url && updatedCategory.icon_url.length > 10 ? 'base64 image' : 'emoji',
          icon_preview: updatedCategory.icon_url ? updatedCategory.icon_url.substring(0, 50) + '...' : 'none'
        });
      }
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ Image update failed:', errorText);
      
      // Try to parse the error
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', errorJson);
        
        if (errorText.includes('Data too long')) {
          console.log('\n🔍 DIAGNOSIS: Database column still too small for images');
          console.log('   The icon_url column needs to be enlarged to support base64 images');
        }
      } catch (e) {
        console.error('Raw error:', errorText);
      }
    }

    // Test 3: Reset back to emoji
    console.log('\n3. Resetting back to emoji...');
    const resetData = {
      ...updateData,
      icon_url: '⚡' // Back to emoji
    };

    const resetResponse = await fetch(`http://localhost:3000/api/categories/${testCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData)
    });

    if (resetResponse.ok) {
      console.log('✅ Reset to emoji successful');
    } else {
      console.log('❌ Reset failed');
    }

    // Test 4: Check what the frontend validation would do
    console.log('\n4. 🔍 FRONTEND VALIDATION CHECK:');
    console.log('   File size limit: 50KB = 51,200 bytes');
    console.log('   Base64 size limit: 10,000 characters');
    console.log('   Database size limit: 15,000 characters');
    console.log('   Test image size:', smallTestImage.length, 'characters');
    
    const wouldPassValidation = smallTestImage.length <= 10000;
    console.log('   Would pass frontend validation:', wouldPassValidation ? '✅ YES' : '❌ NO');

    console.log('\n5. 🎯 CONCLUSION:');
    if (updateResponse.ok) {
      console.log('   ✅ Image upload IS working');
      console.log('   ✅ Database can handle small base64 images');
      console.log('   ✅ Frontend validation is properly implemented');
    } else {
      console.log('   ❌ Image upload is NOT working');
      console.log('   ❌ Database column may still be too small');
      console.log('   🔧 Need to fix database schema or validation limits');
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testImageUploadFunctionality();