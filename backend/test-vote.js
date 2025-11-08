import fetch from 'node-fetch';

async function testVote() {
  try {
    const response = await fetch('http://localhost:5000/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user123',
        electionId: '672d1234567890abcdef1234',
        candidateId: 1,
        voterId: 'VCDL000025OCBJLM5'
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testVote();