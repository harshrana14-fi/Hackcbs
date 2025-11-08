import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
}

testAPI();