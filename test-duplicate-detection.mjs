import fetch from 'node-fetch';

async function testDuplicateDetection() {
  console.log('🧪 Testing Duplicate Detection System...\n');
  
  // Test data with same Instagram as existing application
  const testData = {
    name: "Test Duplicate User 2",
    email: "duplicate.test2@example.com",
    password: "password123",
    confirmPassword: "password123",
    instagram: "prague_fashionista", // Same as existing application
    tiktok: "",
    youtube: "",
    facebook: "https://facebook.com/duplicate.test2",
    categories: ["fashion", "lifestyle"],
    bio: "Testing duplicate detection system",
    collaborationTypes: ["sponsored-posts", "product-reviews"]
  };

  try {
    console.log('📤 Sending test application with duplicate Instagram...');
    const response = await fetch('http://localhost:3000/api/applications/influencer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Application created successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      if (result.duplicatesDetected && result.duplicatesDetected.length > 0) {
        console.log('\n🎯 DUPLICATE DETECTION WORKING!');
        console.log(`Found ${result.duplicatesDetected.length} duplicates:`);
        result.duplicatesDetected.forEach((dup, index) => {
          console.log(`  ${index + 1}. ${dup.type}: ${dup.name || dup.instagramUsername} (ID: ${dup.id})`);
        });
      } else {
        console.log('\n⚠️  No duplicates detected - check implementation');
      }
      
      return result.applicationId;
    } else {
      console.log('❌ Error creating application:', result);
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

async function checkApplicationDetails(applicationId) {
  if (!applicationId) return;
  
  console.log(`\n🔍 Checking application details for ID: ${applicationId}`);
  
  try {
    const response = await fetch(`http://localhost:3000/admin/applications/influencer/${applicationId}`);
    const html = await response.text();
    
    if (html.includes('Duplicate Detection')) {
      console.log('✅ Duplicate Detection section found in UI');
      
      if (html.includes('No duplicate information available')) {
        console.log('⚠️  UI shows "No duplicate information" - check implementation');
      } else {
        console.log('🎯 UI shows duplicate information!');
      }
    } else {
      console.log('❌ Duplicate Detection section not found in UI');
    }
  } catch (error) {
    console.log('❌ Failed to check application details:', error.message);
  }
}

// Run the test
testDuplicateDetection()
  .then(applicationId => checkApplicationDetails(applicationId))
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 