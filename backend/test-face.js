import fetch from 'node-fetch';

async function testFace() {
  try {
    const response = await fetch('http://localhost:5000/api/register/face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "690844b0dceca9d91a6f39aa", // Use the user ID from the previous response
        faceImages: [
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg",
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg",
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQg"
        ] // Sample base64 encoded images
      }),
    });
    
    const data = await response.json();
    console.log('Face Verification Response:', data);
  } catch (error) {
    console.error('Face Test Error:', error.message);
  }
}

testFace();