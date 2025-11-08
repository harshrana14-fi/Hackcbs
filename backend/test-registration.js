import fetch from 'node-fetch';

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/register/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Alice Johnson",
        address: "789 Pine St, City, State",
        age: "28",
        fatherName: "Michael Johnson",
        motherName: "Sarah Johnson",
        phone: "+1555666777",
        email: "alicejohnson@example.com",
        tempAddress: "123 Temporary St",
        permanentAddress: "789 Pine St, City, State",
        occupation: "employed"
      }),
    });
    
    const data = await response.json();
    console.log('Registration Response:', data);
  } catch (error) {
    console.error('Registration Test Error:', error.message);
  }
}

testRegistration();