/**
 * Blockchain utility functions for voting application
 */

// Contract ABI - matches the Voting.sol contract
const CONTRACT_ABI = [
  "function vote(uint electionId, uint candidateId, bytes32 voterHash) public",
  "function getCandidates(uint electionId) public view returns (tuple(uint id, string name, uint voteCount)[])",
  "function getResults(uint electionId) public view returns (tuple(uint id, string name, uint voteCount)[])",
  "function getVoteCount(uint electionId, uint candidateId) public view returns (uint)",
  "function endElection(uint electionId) public",
  "function addCandidate(uint electionId, uint candidateId, string name) public",
  "event VoteCast(uint indexed electionId, uint indexed candidateId, bytes32 indexed voterHash, uint timestamp)",
  "event ElectionEnded(uint indexed electionId, uint timestamp)"
];

// Contract address - in a real app, this would be the deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Hashes a voter ID with a secret to create an anonymous voter hash
 * @param {string} voterId - The voter's ID
 * @param {string} secret - A secret key for hashing
 * @returns {string} - The hashed voter identifier
 */
export function hashVoterId(voterId, secret = "default_secret") {
  // In a real implementation, this would use SHA256
  // For simulation, we'll create a deterministic hash
  const combined = voterId + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string and pad to 64 characters (32 bytes)
  return "0x" + Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

/**
 * Casts a vote on the blockchain
 * @param {Object} voteData - The vote data
 * @param {number} voteData.electionId - The election ID
 * @param {number} voteData.candidateId - The candidate ID
 * @param {string} voteData.voterId - The voter's ID
 * @returns {Object} - The transaction result
 */
export async function castVoteOnBlockchain(voteData) {
  const { electionId, candidateId, voterId } = voteData;
  
  // Validate required fields (electionId and candidateId can be strings or numbers)
  if (!electionId || !candidateId || !voterId) {
    return {
      success: false,
      error: `Missing required fields: electionId=${electionId}, candidateId=${candidateId}, voterId=${voterId}`
    };
  }
  
  // Hash the voter ID to anonymize it
  const voterHash = hashVoterId(voterId);
  
  try {
    // Log the data being sent for debugging
    console.log("Sending vote data to backend:", {
      userId: "user123", // In a real app, this would be the actual user ID
      electionId,
      candidateId,
      voterId
    });
    
    // Get API base URL from environment or use default
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    
    // In a real implementation, this would call the smart contract
    // For now, we'll make an API call to our backend which handles blockchain interaction
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: voteData.userId || "user123", // Use userId from voteData if provided
        electionId, // Keep as string ObjectId
        candidateId, // Keep as string ObjectId
        voterId
      }),
    });
    
    console.log("Vote API response status:", response.status);
    console.log("Vote API response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("Vote API error response (JSON):", errorData);
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          console.error("Vote API error response (text):", errorText);
          errorData = { message: `HTTP ${response.status}: ${errorText}` };
        } catch (textError) {
          console.error("Vote API error response (failed to parse):", textError);
          errorData = { message: `HTTP ${response.status}: Unable to parse error response` };
        }
      }
      throw new Error(errorData.message || "Failed to cast vote");
    }
    
    const result = await response.json();
    console.log("Vote API success response:", result);
    
    return {
      success: true,
      transactionHash: result.transaction.blockchainHash,
      voterHash: result.transaction.voterHash,
      timestamp: result.transaction.timestamp
    };
  } catch (error) {
    console.error("Blockchain vote error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetches election results from the blockchain
 * @param {number} electionId - The election ID
 * @returns {Object} - The election results
 */
export async function fetchResultsFromBlockchain(electionId) {
  try {
    // Get API base URL from environment or use default
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    
    // First try to fetch from the live results endpoint
    try {
      const liveResponse = await fetch(`${API_BASE_URL}/elections/${electionId}/results/live`);
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        return {
          candidates: liveData.results.candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            voteCount: candidate.voteCount,
            party: candidate.party
          }))
        };
      }
    } catch (liveError) {
      console.log("Live results endpoint not available, falling back to legacy endpoint");
    }
    
    // Fall back to the legacy results endpoint
    const response = await fetch(`${API_BASE_URL}/elections/${electionId}/results`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch results");
    }
    
    const result = await response.json();
    
    // Return candidates from the election results
    if (result.election && result.election.candidates) {
      return {
        candidates: result.election.candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          voteCount: candidate.voteCount,
          party: candidate.party
        }))
      };
    }
    
    // Fallback to results format if available
    if (result.results && result.results.candidates) {
      return {
        candidates: result.results.candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          voteCount: candidate.votes || candidate.voteCount,
          party: candidate.party
        }))
      };
    }
    
    return { candidates: [] };
  } catch (error) {
    console.error("Blockchain results error:", error);
    return { candidates: [] };
  }
}

export default {
  hashVoterId,
  castVoteOnBlockchain,
  fetchResultsFromBlockchain
};