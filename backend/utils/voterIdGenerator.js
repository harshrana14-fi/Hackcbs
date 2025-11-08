/**
 * Generates a voter ID in the format: VC + SS + DD + CC + YY + RAND6 + CHK
 * Example: VCAP062325ABCDEF3
 */

// Import state, district, and constituency codes
import { stateCodes, districtCodes, constituencyCodes } from './locationCodes.js';

// Alphanumeric characters (uppercase letters and digits)
const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates a random string of specified length using alphanumeric characters
 * @param {number} length - Length of the random string to generate
 * @returns {string} Random alphanumeric string
 */
function generateAlphanumericString(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHANUMERIC_CHARS.length);
    result += ALPHANUMERIC_CHARS[randomIndex];
  }
  return result;
}

/**
 * Calculates a simple checksum for the voter ID
 * @param {string} idWithoutChecksum - Voter ID without the checksum digit
 * @returns {string} Single checksum character
 */
function calculateChecksum(idWithoutChecksum) {
  let sum = 0;
  for (let i = 0; i < idWithoutChecksum.length; i++) {
    // Convert character to number (A=1, B=2, ..., Z=26, 0=27, 1=28, etc.)
    const char = idWithoutChecksum[i];
    if (char >= 'A' && char <= 'Z') {
      sum += char.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    } else if (char >= '0' && char <= '9') {
      sum += char.charCodeAt(0) - '0'.charCodeAt(0) + 27;
    }
  }
  // Simple modulo checksum
  return (sum % 10).toString();
}

/**
 * Generates a unique voter ID based on location data
 * Format: VC + SS + DD + CC + YY + RAND6 + CHK
 * @param {string} state - State name
 * @param {string} district - District name
 * @param {string} constituency - Constituency name
 * @returns {string} Generated voter ID
 */
export function generateVoterId(state, district, constituency) {
  // Get state code
  const stateCode = stateCodes[state] || "XX"; // Default to XX if not found
  
  // Get district code
  const districtCode = (districtCodes[state] && districtCodes[state][district]) || "00"; // Default to 00 if not found
  
  // Get constituency code
  const constituencyCode = (constituencyCodes[district] && constituencyCodes[district][constituency]) || "00"; // Default to 00 if not found
  
  // Get last two digits of current year
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Generate 6 random alphanumeric characters
  const randomPart = generateAlphanumericString(6);
  
  // Construct ID without checksum
  const idWithoutChecksum = `VC${stateCode}${districtCode}${constituencyCode}${year}${randomPart}`;
  
  // Calculate checksum
  const checksum = calculateChecksum(idWithoutChecksum);
  
  // Return complete voter ID
  return `${idWithoutChecksum}${checksum}`;
}

export default generateVoterId;