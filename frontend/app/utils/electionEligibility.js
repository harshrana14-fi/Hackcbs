/**
 * Utility functions for checking election eligibility
 */

import { decodeVoterId } from "./voterIdDecoder";

/**
 * Check if a user is eligible to vote in a specific election
 * based on their voter ID and the election type
 * @param {string} voterId - The user's voter ID
 * @param {Object} election - The election object
 * @returns {boolean} Whether the user is eligible
 */
export function isUserEligibleForElection(voterId, election) {
  // Decode voter ID to get location information
  const decodedInfo = decodeVoterId(voterId);
  
  // If voter ID is invalid, user is not eligible
  if (!decodedInfo.valid) {
    return false;
  }
  
  // Users are always eligible for Lok Sabha (national) elections
  if (election.electionType === "lok-sabha") {
    return true;
  }
  
  // For state assembly elections, user must be from the same state
  if (election.electionType === "state-assembly") {
    return decodedInfo.state === election.state;
  }
  
  // For local/municipal elections, user must be from the same state
  // (In a more detailed implementation, we might check district as well)
  if (election.electionType === "local" || election.electionType === "municipal") {
    return decodedInfo.state === election.state;
  }
  
  return false;
}

/**
 * Filter elections based on user eligibility
 * @param {string} voterId - The user's voter ID
 * @param {Array} elections - Array of election objects
 * @returns {Array} Filtered array of eligible elections
 */
export function getEligibleElections(voterId, elections) {
  return elections.filter(election => 
    isUserEligibleForElection(voterId, election)
  );
}

export default {
  isUserEligibleForElection,
  getEligibleElections
};