/**
 * Verhoeff Algorithm implementation for Aadhaar number validation
 * The Verhoeff algorithm is a checksum formula for error detection
 * 
 * Aadhaar numbers in India use the Verhoeff algorithm for checksum validation.
 * This implementation validates whether a given 12-digit number is structurally valid.
 */

// Multiplication table d - used for the dihedral group operation
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// Permutation table p - used to permute digits based on position
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates an Aadhaar number using the Verhoeff algorithm
 * @param {string} aadhaarNumber - The Aadhaar number to validate (with or without spaces)
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateAadhaar(aadhaarNumber) {
  // Remove any spaces or non-digit characters
  const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
  
  // Check if it's exactly 12 digits
  if (cleanAadhaar.length !== 12) {
    return false;
  }
  
  // Check if all characters are digits
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return false;
  }
  
  // Apply Verhoeff algorithm
  // The algorithm processes digits from right to left
  let checksum = 0;
  
  for (let i = 0; i < 12; i++) {
    // Get digit from right to left
    const digit = parseInt(cleanAadhaar[11 - i], 10);
    // Apply permutation based on position and multiply with current checksum
    checksum = d[checksum][p[(i + 1) % 8][digit]];
  }
  
  // Valid if checksum is 0
  return checksum === 0;
}

export default validateAadhaar;