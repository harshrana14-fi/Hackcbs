import generateVoterId from './utils/voterIdGenerator.js';

// Test the voter ID generation
console.log('Testing voter ID generation:');
for (let i = 0; i < 5; i++) {
  const voterId = generateVoterId();
  console.log(`Generated Voter ID ${i + 1}: ${voterId}`);
}

console.log('Test completed.');