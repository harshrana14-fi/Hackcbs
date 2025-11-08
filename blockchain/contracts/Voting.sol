// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    
    struct VoteRecord {
        uint electionId;
        uint candidateId;
        bytes32 voterHash;
        uint timestamp;
    }
    
    mapping(uint => mapping(bytes32 => bool)) public hasVoted; // electionId => voterHash => hasVoted
    mapping(uint => Candidate[]) public candidates; // electionId => candidates
    mapping(uint => VoteRecord[]) public votes; // electionId => votes
    mapping(uint => bool) public electionEnded; // electionId => ended
    
    event VoteCast(
        uint indexed electionId,
        uint indexed candidateId,
        bytes32 indexed voterHash,
        uint timestamp
    );
    
    event ElectionEnded(
        uint indexed electionId,
        uint timestamp
    );
    
    // Add a candidate to an election
    function addCandidate(uint electionId, uint candidateId, string memory name) public {
        candidates[electionId].push(Candidate(candidateId, name, 0));
    }
    
    // Vote in an election
    function vote(uint electionId, uint candidateId, bytes32 voterHash) public {
        // Check if election has ended
        require(!electionEnded[electionId], "Election has ended");
        
        // Check if voter has already voted in this election
        require(!hasVoted[electionId][voterHash], "You have already voted in this election!");
        
        // Check if candidate is valid
        bool candidateExists = false;
        for (uint i = 0; i < candidates[electionId].length; i++) {
            if (candidates[electionId][i].id == candidateId) {
                candidateExists = true;
                candidates[electionId][i].voteCount++;
                break;
            }
        }
        require(candidateExists, "Invalid candidate!");
        
        // Record the vote
        hasVoted[electionId][voterHash] = true;
        votes[electionId].push(VoteRecord(electionId, candidateId, voterHash, block.timestamp));
        
        // Emit event
        emit VoteCast(electionId, candidateId, voterHash, block.timestamp);
    }
    
    // End an election
    function endElection(uint electionId) public {
        electionEnded[electionId] = true;
        emit ElectionEnded(electionId, block.timestamp);
    }
    
    // Get candidates for an election
    function getCandidates(uint electionId) public view returns (Candidate[] memory) {
        return candidates[electionId];
    }
    
    // Get results for an election
    function getResults(uint electionId) public view returns (Candidate[] memory) {
        require(electionEnded[electionId], "Election is still ongoing");
        return candidates[electionId];
    }
    
    // Get vote count for a candidate
    function getVoteCount(uint electionId, uint candidateId) public view returns (uint) {
        for (uint i = 0; i < candidates[electionId].length; i++) {
            if (candidates[electionId][i].id == candidateId) {
                return candidates[electionId][i].voteCount;
            }
        }
        return 0;
    }
    
    // Get all votes for an election (vote bank)
    function getVoteBank(uint electionId) public view returns (VoteRecord[] memory) {
        return votes[electionId];
    }
    
    // Get total vote count for an election
    function getTotalVotes(uint electionId) public view returns (uint) {
        return votes[electionId].length;
    }
    
    // Check if a voter has voted in an election
    function checkVoterVoted(uint electionId, bytes32 voterHash) public view returns (bool) {
        return hasVoted[electionId][voterHash];
    }
    
    // Get vote record by index for an election
    function getVoteByIndex(uint electionId, uint index) public view returns (VoteRecord memory) {
        require(index < votes[electionId].length, "Vote index out of bounds");
        return votes[electionId][index];
    }
}