import fetch from 'node-fetch';

async function testFullRegistration() {
  try {
    console.log('Testing full registration flow with voter ID generation...\n');
    
    // Step 1: Register personal details
    console.log('Step 1: Registering personal details...');
    const personalResponse = await fetch('http://localhost:5000/api/register/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Test User",
        address: "123 Test Street",
        age: "25",
        fatherName: "Father Test",
        motherName: "Mother Test",
        phone: "+1234567890",
        email: "testuser@example.com",
        tempAddress: "123 Temporary St",
        permanentAddress: "123 Test Street",
        occupation: "employed"
      }),
    });
    
    const personalData = await personalResponse.json();
    console.log('Personal registration response:', personalData);
    
    if (!personalData.user || !personalData.user.id) {
      throw new Error('Failed to register personal details');
    }
    
    const userId = personalData.user.id;
    console.log(`User ID: ${userId}\n`);
    
    // Step 2: Aadhaar verification
    console.log('Step 2: Aadhaar verification...');
    const aadhaarResponse = await fetch('http://localhost:5000/api/register/aadhaar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        aadhaarNumber: "123456789012"
      }),
    });
    
    const aadhaarData = await aadhaarResponse.json();
    console.log('Aadhaar verification response:', aadhaarData);
    console.log('\n');
    
    // Step 3: Face verification (this should generate the voter ID)
    console.log('Step 3: Face verification...');
    const faceResponse = await fetch('http://localhost:5000/api/register/face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        faceImages: [
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg",
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg",
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg"
        ]
      }),
    });
    
    const faceData = await faceResponse.json();
    console.log('Face verification response:', faceData);
    
    if (faceData.user && faceData.user.voterId) {
      console.log(`\n✅ SUCCESS: Voter ID generated: ${faceData.user.voterId}`);
    } else {
      console.log('\n❌ ERROR: Voter ID was not generated');
    }
    
    console.log('\n✅ Full registration test completed!');
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testFullRegistration();