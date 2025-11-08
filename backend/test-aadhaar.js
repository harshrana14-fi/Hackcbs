import fetch from 'node-fetch';

async function testAadhaar() {
  try {
    const response = await fetch('http://localhost:5000/api/register/aadhaar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "690844b0dceca9d91a6f39aa", // Use the user ID from the previous response
        aadhaarNumber: "123456789012"
      }),
    });
    
    const data = await response.json();
    console.log('Aadhaar Response:', data);
  } catch (error) {
    console.error('Aadhaar Test Error:', error.message);
  }
}

testAadhaar();