import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Current directory:", __dirname);
console.log("Loading .env.local from:", __dirname + "/.env.local");

// Load environment variables
dotenv.config({ path: __dirname + "/.env.local" });

console.log("Environment variables loaded:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "Not found");
console.log("PORT:", process.env.PORT || "Not found");

import express from "express";
import cors from "cors";
import connectDB, { isConnected } from "./db.js";
import User from "./models/usermodel.js";
import Kyc from "./models/KYCmodel.js";
import Admin from "./models/adminModel.js";
import Election from "./models/electionModel.js";
import Vote from "./models/voteModel.js";
import generateVoterId from "./utils/voterIdGenerator.js";

// Connect to MongoDB
connectDB();

// Helper function to handle MongoDB connection errors
const handleDbError = (error, res, fallbackResponse = null) => {
  if (error.name === 'MongoServerSelectionError' || 
      error.name === 'MongoNetworkError' || 
      error.name === 'MongoTimeoutError') {
    console.error(`⚠️ Database connection error: ${error.name} - ${error.message}`);
    if (fallbackResponse) {
      return res.status(200).json(fallbackResponse);
    }
    return res.status(503).json({ 
      message: "Database temporarily unavailable. Please try again later.",
      error: "Database connection timeout"
    });
  }
  return null; // Not a connection error, let it be handled normally
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // For handling base64 encoded images
app.use(express.urlencoded({ extended: true }));

// Registration API endpoint
app.post("/api/register/personal", async (req, res) => {
  try {
    const {
      name,
      age,
      fatherName,
      motherName,
      phone,
      email,
      presentAddress,
      permanentAddress,
      isSameAsPermanent,
      occupation,
    } = req.body;

    console.log("Registration request received:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user
    const user = new User({
      fullName: name,
      email,
      phone,
      role: "voter", // Set as voter for citizens registering to vote
      password: "temp_password", // Will be set properly during final registration
    });

    const savedUser = await user.save();
    console.log("User saved:", savedUser._id);

    // Create initial KYC record with address details
    const kyc = new Kyc({
      user: savedUser._id,
      aadhaarNumber: "pending", // Use a placeholder value
      aadhaarVerified: false,
      faceVerified: false,
      verificationStatus: "pending",
      presentAddress: presentAddress || {},
      permanentAddress: permanentAddress || {},
      isSameAsPermanent: isSameAsPermanent || false,
      district: req.body.district || "",
      constituency: req.body.constituency || "",
    });

    const savedKyc = await kyc.save();
    console.log("KYC record saved:", savedKyc._id);

    // Update user with KYC reference
    savedUser.kycRef = savedKyc._id;
    await savedUser.save();

    res.status(201).json({
      message: "Personal details saved successfully",
      user: {
        id: savedUser._id,
        name: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// Aadhaar verification API endpoint
app.post("/api/register/aadhaar", async (req, res) => {
  try {
    const { userId, aadhaarNumber, addressProofType } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (!aadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }
    
    // Validate addressProofType if provided
    const validAddressProofTypes = ["aadhaar", "passport", "driving_license", "voter_id", "bank_statement", "rent_agreement", "other"];
    if (addressProofType && !validAddressProofTypes.includes(addressProofType)) {
      return res.status(400).json({ 
        message: `Invalid address proof type: ${addressProofType}. Valid types are: ${validAddressProofTypes.join(", ")}` 
      });
    }

    // Find user and update KYC details
    const user = await User.findById(userId).populate("kycRef");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update KYC record
    const kyc = await Kyc.findById(user.kycRef);
    if (!kyc) {
      return res.status(404).json({ message: "KYC record not found" });
    }

    kyc.aadhaarNumber = aadhaarNumber;
    // In a real implementation, we would verify the Aadhaar details here
    kyc.aadhaarVerified = true;
    kyc.verificationStatus = "pending"; // Will be updated after face verification
    
    // Also save address proof type if provided
    if (addressProofType) {
      kyc.addressProofType = addressProofType;
      // For now, we'll just set a placeholder for the document
      kyc.addressProofDocument = "uploaded_address_proof_document";
    }

    await kyc.save();

    // Update user verification status
    user.isAadhaarVerified = true;
    await user.save();

    const response = {
      message: "Aadhaar details saved successfully",
      kyc: {
        id: kyc._id,
        aadhaarNumber: kyc.aadhaarNumber,
        aadhaarVerified: kyc.aadhaarVerified,
      },
    };
    
    // Add address proof info to response if applicable
    if (addressProofType) {
      response.kyc.addressProofType = kyc.addressProofType;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Aadhaar verification error:", error);
    res.status(500).json({ message: "Server error during Aadhaar verification", error: error.message });
  }
});

// Face verification API endpoint
app.post("/api/register/face", async (req, res) => {
  try {
    const { userId, faceImages } = req.body;
    console.log("Face verification request:", { userId, faceImagesCount: faceImages?.length });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (!faceImages || !Array.isArray(faceImages)) {
      return res.status(400).json({ message: "Face images are required and must be an array" });
    }

    // Find user and update KYC details
    const user = await User.findById(userId).populate("kycRef");
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Update KYC record with face images
    const kyc = await Kyc.findById(user.kycRef);
    if (!kyc) {
      console.log("KYC record not found:", user.kycRef);
      return res.status(404).json({ message: "KYC record not found" });
    }

    kyc.faceImages = faceImages;
    // In a real implementation, we would verify the face images here
    kyc.faceVerified = true;
    kyc.verificationStatus = "verified"; // All verifications complete

    await kyc.save();

    // Update user verification status
    user.isFaceVerified = true;
    user.kycStatus = "verified";
    
    // Generate and save voter ID
    try {
      // Use state from KYC record, and district/constituency from KYC record
      const state = kyc.presentAddress?.state || "Delhi";
      const district = kyc.district || kyc.presentAddress?.city || "Delhi";
      const constituency = kyc.constituency || district;
      
      console.log("Generating voter ID with:", { state, district, constituency });
      user.voterId = generateVoterId(state, district, constituency);
      console.log("Generated voter ID:", user.voterId);
    } catch (voterIdError) {
      console.error("Error generating voter ID:", voterIdError);
      // Use a fallback voter ID format if there's an error
      const fallbackId = `VC${new Date().getFullYear().toString().slice(-2)}${Math.random().toString(36).substring(2, 8).toUpperCase()}0`;
      user.voterId = fallbackId;
      console.log("Using fallback voter ID:", user.voterId);
    }
    
    await user.save();

    res.status(200).json({
      message: "Face verification completed successfully",
      user: {
        id: user._id,
        name: user.fullName,
        voterId: user.voterId,
        isAadhaarVerified: user.isAadhaarVerified,
        isFaceVerified: user.isFaceVerified,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Server error during face verification", error: error.message });
  }
});

// Login API endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { voterId } = req.body;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // Basic format validation
    if (voterId.length !== 17 || !voterId.startsWith('VC')) {
      return res.status(400).json({ message: "Invalid voter ID format" });
    }
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Check the database for the voter ID
    let user;
    try {
      user = await User.findOne({ voterId });
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!user) {
      return res.status(404).json({ message: "Voter ID not found. Please register first." });
    }
    
    // Check if user is verified
    if (user.kycStatus !== "verified") {
      return res.status(403).json({ 
        message: "Your account is not yet verified. Please complete KYC verification." 
      });
    }
    
    // Return success response
    res.status(200).json({
      message: "Voter ID validated successfully",
      voterId: voterId,
      valid: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// Get eligible elections for a voter
app.post("/api/elections/eligible", async (req, res) => {
  try {
    const { voterId, state } = req.body;
    
    // Validate required fields
    if (!voterId || !state) {
      return res.status(400).json({ message: "Voter ID and state are required" });
    }
    
    // Check if database is connected
    if (!isConnected()) {
      console.warn("⚠️ Database not connected, returning empty elections list");
      return res.status(200).json({
        message: "Eligible elections retrieved successfully",
        elections: []
      });
    }
    
    // Fetch all active elections from the database
    let allElections = [];
    let userVotes = [];
    
    try {
      allElections = await Election.find({ isActive: true });
      userVotes = await Vote.find({ voterId });
      console.log(`Found ${userVotes.length} votes for voter ${voterId}`);
    } catch (dbError) {
      // Handle MongoDB connection errors gracefully
      if (dbError.name === 'MongoServerSelectionError' || dbError.name === 'MongoNetworkError') {
        console.error("⚠️ Database connection error, returning empty elections list:", dbError.message);
        return res.status(200).json({
          message: "Eligible elections retrieved successfully",
          elections: []
        });
      }
      throw dbError; // Re-throw if it's not a connection error
    }
    
    // Convert election IDs to strings for comparison (handle both ObjectId and string)
    const votedElectionIds = new Set(
      userVotes.map(vote => {
        const electionId = vote.electionId;
        const idString = electionId ? (electionId.toString ? electionId.toString() : String(electionId)) : null;
        console.log(`Vote electionId: ${idString} (type: ${typeof electionId})`);
        return idString;
      }).filter(id => id !== null)
    );
    
    console.log(`Voted election IDs:`, Array.from(votedElectionIds));
    
    // Filter elections based on voter's eligibility
    const eligibleElections = allElections.filter(election => {
      // All users are eligible for Lok Sabha elections
      if (election.electionType === "lok-sabha") {
        return true;
      }
      
      // Users are eligible for state elections in their state
      if (election.electionType === "state-assembly" && election.state === state) {
        return true;
      }
      
      // Users are eligible for local elections in their state
      if (election.electionType === "local" && election.state === state) {
        return true;
      }
      
      return false;
    });
    
    const electionsWithVoteStatus = eligibleElections.map(election => {
      const electionIdString = election._id.toString();
      const hasVoted = votedElectionIds.has(electionIdString);
      console.log(`Election ${election.title} (${electionIdString}): hasVoted=${hasVoted}`);
      
      return {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        electionType: election.electionType,
        state: election.state,
        district: election.district,
        constituency: election.constituency,
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        userHasVoted: hasVoted
      };
    });
    
    res.status(200).json({
      message: "Eligible elections retrieved successfully",
      elections: electionsWithVoteStatus
    });
  } catch (error) {
    console.error("Error getting eligible elections:", error);
    
    // Handle MongoDB connection errors gracefully
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      console.warn("⚠️ Database connection error, returning empty elections list");
      return res.status(200).json({
        message: "Eligible elections retrieved successfully",
        elections: []
      });
    }
    
    res.status(500).json({ message: "Server error while retrieving elections", error: error.message });
  }
});

// Get election candidates
app.get("/api/elections/:electionId/candidates", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(200).json({
        message: "Candidates retrieved successfully",
        candidates: []
      });
    }
    
    // Find the election in the database
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res, {
        message: "Candidates retrieved successfully",
        candidates: []
      });
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Return the actual candidates from the database
    const candidates = election.candidates.map((candidate, index) => ({
      id: candidate._id.toString(),
      name: candidate.name,
      party: candidate.party,
      voteCount: candidate.voteCount
    }));
    
    res.status(200).json({
      message: "Candidates retrieved successfully",
      candidates
    });
  } catch (error) {
    console.error("Error getting candidates:", error);
    const handled = handleDbError(error, res, {
      message: "Candidates retrieved successfully",
      candidates: []
    });
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving candidates", error: error.message });
  }
});

// Cast a vote (real-time blockchain implementation)
app.post("/api/vote", async (req, res) => {
  try {
    const { userId, electionId, candidateId, voterId } = req.body;
    
    // Log the incoming request for debugging
    console.log("Vote request received:", { userId, electionId, candidateId, voterId });
    
    // Validate required fields
    if (!userId || !electionId || !candidateId || !voterId) {
      return res.status(400).json({ message: "User ID, election ID, candidate ID, and voter ID are required" });
    }
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Check if election is active
    if (!election.isActive || election.isCompleted) {
      return res.status(400).json({ message: "Election is not active" });
    }
    
    // Find the candidate by ID (candidateId can be either ObjectId string or index)
    let candidate = null;
    let candidateObjectId = null;
    
    // First try to find by ObjectId
    candidate = election.candidates.find(c => c._id.toString() === candidateId);
    
    // If not found, try as index (for backward compatibility)
    if (!candidate) {
      const candidateIndex = parseInt(candidateId);
      if (!isNaN(candidateIndex) && candidateIndex >= 0 && candidateIndex < election.candidates.length) {
        candidate = election.candidates[candidateIndex];
      }
    }
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found in this election" });
    }
    
    candidateObjectId = candidate._id;
    
    console.log("Candidate found:", { candidateObjectId, candidateName: candidate.name });
    
    // Create anonymous voter hash using proper cryptographic hash
    const salt = process.env.VOTER_HASH_SALT || "votechain_secret_salt_2025";
    const voterHash = "0x" + crypto.createHash('sha256').update(voterId + salt).digest('hex');
    
    // Generate transaction hash (in production, this would come from blockchain)
    const transactionHash = "0x" + crypto.createHash('sha256').update(voterId + electionId + candidateId + Date.now().toString()).digest('hex').substring(0, 64);
    
    console.log("Generated hashes:", { voterHash, transactionHash });
    
    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ voterId, electionId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted in this election" });
    }
    
    // Get user by userId or voterId
    let user = null;
    if (userId && userId !== "user123") {
      // Try to find by userId first
      user = await User.findById(userId);
    }
    
    // If not found by userId, try to find by voterId
    if (!user) {
      user = await User.findOne({ voterId });
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found. Please ensure you are logged in with a valid voter ID." });
    }
    
    // Get user's state from KYC or use default
    const kyc = user.kycRef ? await Kyc.findById(user.kycRef) : null;
    const voterState = kyc?.presentAddress?.state || "Delhi";
    
    // In a real blockchain implementation, we would:
    // 1. Call the smart contract function: vote(uint electionId, uint candidateId, bytes32 voterHash)
    // 2. Wait for the transaction to be mined
    // 3. Return the actual blockchain transaction hash
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save vote to MongoDB for tracking
    const vote = new Vote({
      voterId,
      electionId,
      candidateId: candidateObjectId,
      voterState,
      blockchainHash: transactionHash
    });
    
    await vote.save();
    console.log(`Vote saved successfully: voterId=${voterId}, electionId=${electionId}, voteId=${vote._id}`);
    
    // Update candidate vote count
    const candidateIndex = election.candidates.findIndex(c => c._id.toString() === candidateObjectId.toString());
    if (candidateIndex !== -1) {
      election.candidates[candidateIndex].voteCount = (election.candidates[candidateIndex].voteCount || 0) + 1;
      election.markModified('candidates');
      await election.save();
    }
    
    // Update user's votes array
    user.votes.push(vote._id);
    await user.save();
    
    const voteTransaction = {
      userId,
      electionId,
      candidateId: candidateObjectId,
      voterHash,
      timestamp: new Date(),
      blockchainHash: transactionHash
    };
    
    res.status(200).json({
      message: "Vote cast successfully on blockchain",
      transaction: voteTransaction
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Server error while casting vote", error: error.message });
  }
});

// Get election results (legacy endpoint - using real vote data from blockchain/database)
app.get("/api/results/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the election
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Get all votes for this election from the Vote collection (real blockchain data)
    let votes = [];
    try {
      votes = await Vote.find({ electionId });
      console.log(`Found ${votes.length} real votes for election ${electionId}`);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    // Count votes for each candidate from the Vote collection
    const candidateVoteCounts = new Map();
    votes.forEach(vote => {
      // Handle both ObjectId and string candidateId
      const candidateId = vote.candidateId ? 
        (vote.candidateId.toString ? vote.candidateId.toString() : String(vote.candidateId)) : 
        null;
      if (candidateId) {
        candidateVoteCounts.set(candidateId, (candidateVoteCounts.get(candidateId) || 0) + 1);
      }
    });
    
    console.log(`Vote counts by candidate:`, Object.fromEntries(candidateVoteCounts));
    
    // Map candidates with real vote counts from blockchain/database
    const candidatesWithRealVotes = election.candidates.map((candidate) => {
      const candidateId = candidate._id.toString();
      const realVoteCount = candidateVoteCounts.get(candidateId) || 0;
      
      return {
        id: candidateId,
        name: candidate.name,
        party: candidate.party,
        voteCount: realVoteCount, // Real vote count from Vote collection
      };
    });
    
    // Sort candidates by vote count (descending)
    candidatesWithRealVotes.sort((a, b) => b.voteCount - a.voteCount);
    
    // Calculate total votes
    const totalVotes = candidatesWithRealVotes.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    // Format results
    const results = {
      electionId: election._id.toString(),
      title: election.title,
      date: election.endDate.toLocaleDateString(),
      totalVotes: totalVotes,
      candidates: candidatesWithRealVotes.map((candidate, index) => ({
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        votes: candidate.voteCount, // Real votes from Vote collection
        percentage: totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 1000) / 10 : 0
      }))
    };
    
    res.status(200).json({
      message: "Results retrieved successfully",
      results
    });
  } catch (error) {
    console.error("Error getting results:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving results", error: error.message });
  }
});

// Get real-time election results from blockchain (using real vote data)
app.get("/api/elections/:electionId/results/live", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the election
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Get all votes for this election from the Vote collection (blockchain data)
    let votes = [];
    try {
      votes = await Vote.find({ electionId });
      console.log(`Found ${votes.length} real votes for election ${electionId}`);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    // Count votes for each candidate from the Vote collection
    const candidateVoteCounts = new Map();
    votes.forEach(vote => {
      // Handle both ObjectId and string candidateId
      const candidateId = vote.candidateId ? 
        (vote.candidateId.toString ? vote.candidateId.toString() : String(vote.candidateId)) : 
        null;
      if (candidateId) {
        candidateVoteCounts.set(candidateId, (candidateVoteCounts.get(candidateId) || 0) + 1);
      }
    });
    
    console.log(`Vote counts by candidate:`, Object.fromEntries(candidateVoteCounts));
    
    // Map candidates with real vote counts from blockchain/database
    const candidatesWithRealVotes = election.candidates.map((candidate) => {
      const candidateId = candidate._id.toString();
      const realVoteCount = candidateVoteCounts.get(candidateId) || 0;
      
      return {
        id: candidateId,
        name: candidate.name,
        party: candidate.party,
        voteCount: realVoteCount, // Real vote count from Vote collection
      };
    });
    
    // Sort candidates by vote count (descending)
    candidatesWithRealVotes.sort((a, b) => b.voteCount - a.voteCount);
    
    // Calculate total votes and percentages
    const totalVotes = candidatesWithRealVotes.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    const results = {
      electionId: election._id.toString(),
      title: election.title,
      description: election.description,
      electionType: election.electionType,
      startDate: election.startDate,
      endDate: election.endDate,
      isActive: election.isActive,
      isCompleted: election.isCompleted,
      lastUpdated: new Date(),
      totalVotes: totalVotes,
      candidates: candidatesWithRealVotes.map(candidate => ({
        ...candidate,
        percentage: totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 1000) / 10 : 0
      }))
    };
    
    res.status(200).json({
      message: "Live results retrieved successfully",
      results
    });
  } catch (error) {
    console.error("Error getting live results:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving live results", error: error.message });
  }
});

// Get KYC status
app.get("/api/kyc/status/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // In a real implementation, this would fetch KYC status from the database
    // For now, returning sample data
    const kycStatus = {
      voterId,
      aadhaarVerified: true,
      faceVerified: true,
      voterIdGenerated: true,
      remarks: "All verification steps completed successfully"
    };
    
    res.status(200).json({
      message: "KYC status retrieved successfully",
      kycStatus
    });
  } catch (error) {
    console.error("Error getting KYC status:", error);
    res.status(500).json({ message: "Server error while retrieving KYC status", error: error.message });
  }
});

// Get user profile
app.get("/api/profile/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // Find user by voter ID
    const user = await User.findOne({ voterId }).populate("kycRef");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get KYC data
    const kyc = user.kycRef ? await Kyc.findById(user.kycRef) : null;
    
    // Build profile from user and KYC data
    const profile = {
      voterId: user.voterId,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      presentAddress: kyc?.presentAddress || {},
      permanentAddress: kyc?.permanentAddress || {},
      district: kyc?.district || "",
      constituency: kyc?.constituency || "",
      isAadhaarVerified: user.isAadhaarVerified || false,
      isFaceVerified: user.isFaceVerified || false,
      kycStatus: user.kycStatus || "pending"
    };
    
    res.status(200).json({
      message: "Profile retrieved successfully",
      profile
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error while retrieving profile", error: error.message });
  }
});

// Update user profile
app.put("/api/profile/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;
    const { name, email, phone, presentAddress, permanentAddress, district, constituency } = req.body;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // Find user by voter ID
    const user = await User.findOne({ voterId }).populate("kycRef");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user fields
    if (name) user.fullName = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    await user.save();
    
    // Update KYC data if exists
    if (user.kycRef) {
      const kyc = await Kyc.findById(user.kycRef);
      if (kyc) {
        if (presentAddress) kyc.presentAddress = { ...kyc.presentAddress, ...presentAddress };
        if (permanentAddress) kyc.permanentAddress = { ...kyc.permanentAddress, ...permanentAddress };
        if (district) kyc.district = district;
        if (constituency) kyc.constituency = constituency;
        await kyc.save();
      }
    }
    
    // Get updated profile
    const updatedUser = await User.findOne({ voterId }).populate("kycRef");
    const updatedKyc = updatedUser.kycRef ? await Kyc.findById(updatedUser.kycRef) : null;
    
    const profile = {
      voterId: updatedUser.voterId,
      name: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      presentAddress: updatedKyc?.presentAddress || {},
      permanentAddress: updatedKyc?.permanentAddress || {},
      district: updatedKyc?.district || "",
      constituency: updatedKyc?.constituency || "",
      isAadhaarVerified: updatedUser.isAadhaarVerified || false,
      isFaceVerified: updatedUser.isFaceVerified || false,
      kycStatus: updatedUser.kycStatus || "pending"
    };
    
    res.status(200).json({
      message: "Profile updated successfully",
      profile
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile", error: error.message });
  }
});

// Get user's voting history
app.get("/api/voters/:voterId/history", async (req, res) => {
  try {
    const { voterId } = req.params;
    
    // Validate required fields
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required" });
    }
    
    // Check if database is connected
    if (!isConnected()) {
      console.warn("⚠️ Database not connected, returning empty voting history");
      return res.status(200).json({
        message: "Voting history retrieved successfully",
        votingHistory: []
      });
    }
    
    // Check if database is connected
    if (!isConnected()) {
      console.warn("⚠️ Database not connected, returning empty voting history");
      return res.status(200).json({
        message: "Voting history retrieved successfully",
        votingHistory: []
      });
    }
    
    // Find all votes by this voter and populate election details
    let votes = [];
    try {
      votes = await Vote.find({ voterId }).populate({
        path: 'electionId',
        select: 'title electionType startDate endDate isActive isCompleted'
      });
    } catch (dbError) {
      // Handle MongoDB connection errors gracefully
      if (dbError.name === 'MongoServerSelectionError' || dbError.name === 'MongoNetworkError') {
        console.error("⚠️ Database connection error, returning empty voting history:", dbError.message);
        return res.status(200).json({
          message: "Voting history retrieved successfully",
          votingHistory: []
        });
      }
      throw dbError; // Re-throw if it's not a connection error
    }
    
    // Transform votes into a more user-friendly format
    const votingHistory = await Promise.all(votes.map(async (vote) => {
      // Get candidate details
      let candidateName = "Unknown Candidate";
      if (vote.electionId) {
        const election = await Election.findById(vote.electionId._id);
        if (election) {
          const candidate = election.candidates.id(vote.candidateId);
          if (candidate) {
            candidateName = candidate.name;
          }
        }
      }
      
      return {
        id: vote._id,
        electionId: vote.electionId ? vote.electionId._id : null,
        electionTitle: vote.electionId ? vote.electionId.title : "Unknown Election",
        electionType: vote.electionId ? vote.electionId.electionType : "Unknown",
        candidateId: vote.candidateId,
        candidateName: candidateName,
        timestamp: vote.timestamp,
        blockchainHash: vote.blockchainHash
      };
    }));
    
    res.status(200).json({
      message: "Voting history retrieved successfully",
      votingHistory
    });
  } catch (error) {
    console.error("Error getting voting history:", error);
    
    // Handle MongoDB connection errors gracefully
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      console.warn("⚠️ Database connection error, returning empty voting history");
      return res.status(200).json({
        message: "Voting history retrieved successfully",
        votingHistory: []
      });
    }
    
    res.status(500).json({ message: "Server error while retrieving voting history", error: error.message });
  }
});

// Admin registration
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, email, password, organization, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !organization || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }
    
    // Hash password using crypto (built-in Node.js module)
    const salt = process.env.PASSWORD_SALT || 'default_salt';
    const hashedPassword = crypto.createHash('sha256').update(password + salt).digest('hex');
    
    // Create new admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      organization,
      department,
    });
    
    const savedAdmin = await admin.save();
    
    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        organization: savedAdmin.organization,
        department: savedAdmin.department
      }
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error during admin registration", error: error.message });
  }
});

// Create a new election (admin only)
app.post("/api/admin/elections", async (req, res) => {
  try {
    // In a real implementation, we would verify admin authentication
    // For now, we'll just create the election
    
    const { title, description, electionType, state, district, constituency, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!title || !description || !electionType || !state || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate election type
    const validElectionTypes = ["lok-sabha", "state-assembly", "local"];
    if (!validElectionTypes.includes(electionType)) {
      return res.status(400).json({ message: "Invalid election type" });
    }
    
    // Create election object
    const election = new Election({
      title,
      description,
      electionType,
      state,
      district: district || "",
      constituency: constituency || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
      isCompleted: false,
      totalVotes: 0,
      candidates: []
    });
    
    const savedElection = await election.save();
    
    res.status(201).json({
      message: "Election created successfully",
      election: {
        id: savedElection._id,
        title: savedElection.title,
        description: savedElection.description,
        electionType: savedElection.electionType,
        state: savedElection.state,
        district: savedElection.district,
        constituency: savedElection.constituency,
        startDate: savedElection.startDate,
        endDate: savedElection.endDate,
        isActive: savedElection.isActive,
        isCompleted: savedElection.isCompleted,
        createdAt: savedElection.createdAt,
        updatedAt: savedElection.updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Server error while creating election", error: error.message });
  }
});

// Get all elections (for admin dashboard)
app.get("/api/admin/elections", async (req, res) => {
  try {
    // In a real implementation, we would verify admin authentication
    
    // Fetch elections from the database
    const elections = await Election.find({}).sort({ createdAt: -1 });
    
    const formattedElections = elections.map(election => {
      const candidates = (election.candidates || []).map(candidate => ({
        id: candidate._id ? candidate._id.toString() : null,
        name: candidate.name || "",
        party: candidate.party || "",
        voteCount: candidate.voteCount || 0
      }));
      
      console.log(`Election ${election._id} has ${candidates.length} candidates:`, candidates);
      
      return {
        id: election._id.toString(),
        title: election.title,
        description: election.description,
        electionType: election.electionType,
        state: election.state,
        district: election.district || "",
        constituency: election.constituency || "",
        startDate: election.startDate ? election.startDate.toISOString().split('T')[0] : null,
        endDate: election.endDate ? election.endDate.toISOString().split('T')[0] : null,
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        candidates: candidates,
        createdAt: election.createdAt,
        updatedAt: election.updatedAt
      };
    });
    
    console.log(`Returning ${formattedElections.length} elections with candidates`);
    
    res.status(200).json({
      message: "Elections retrieved successfully",
      elections: formattedElections
    });
  } catch (error) {
    console.error("Error getting elections:", error);
    res.status(500).json({ message: "Server error while retrieving elections", error: error.message });
  }
});

// Add candidate to election
app.post("/api/admin/elections/:electionId/candidates", async (req, res) => {
  try {
    const { electionId } = req.params;
    const { name, party } = req.body;
    
    // Validate required fields
    if (!name || !party) {
      return res.status(400).json({ message: "Candidate name and party are required" });
    }
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Add candidate to election
    const newCandidate = {
      name,
      party,
      voteCount: 0
    };
    
    election.candidates.push(newCandidate);
    const savedElection = await election.save();
    
    // Get the newly added candidate (it will be the last one)
    const addedCandidate = savedElection.candidates[savedElection.candidates.length - 1];
    
    res.status(201).json({
      message: "Candidate added successfully",
      candidate: {
        id: addedCandidate._id.toString(),
        name: addedCandidate.name,
        party: addedCandidate.party,
        voteCount: addedCandidate.voteCount
      },
      election: {
        id: savedElection._id.toString(),
        candidates: savedElection.candidates.map(c => ({
          id: c._id.toString(),
          name: c.name,
          party: c.party,
          voteCount: c.voteCount || 0
        }))
      }
    });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Server error while adding candidate", error: error.message });
  }
});

// Remove candidate from election
app.delete("/api/admin/elections/:electionId/candidates/:candidateId", async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Check if candidate exists
    const candidateIndex = election.candidates.findIndex(candidate => 
      candidate._id.toString() === candidateId
    );
    
    if (candidateIndex === -1) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    // Remove candidate from election
    election.candidates.splice(candidateIndex, 1);
    await election.save();
    
    res.status(200).json({
      message: "Candidate removed successfully"
    });
  } catch (error) {
    console.error("Error removing candidate:", error);
    res.status(500).json({ message: "Server error while removing candidate", error: error.message });
  }
});

// End election
app.post("/api/admin/elections/:electionId/end", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // End the election
    await election.endElection();
    
    res.status(200).json({
      message: "Election ended successfully",
      election
    });
  } catch (error) {
    console.error("Error ending election:", error);
    res.status(500).json({ message: "Server error while ending election", error: error.message });
  }
});

// Get election results (using real vote data from blockchain/database)
app.get("/api/elections/:electionId/results", async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the election
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Get all votes for this election from the Vote collection (real blockchain data)
    let votes = [];
    try {
      votes = await Vote.find({ electionId });
      console.log(`Found ${votes.length} real votes for election ${electionId}`);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    // Count votes for each candidate from the Vote collection
    const candidateVoteCounts = new Map();
    votes.forEach(vote => {
      // Handle both ObjectId and string candidateId
      const candidateId = vote.candidateId ? 
        (vote.candidateId.toString ? vote.candidateId.toString() : String(vote.candidateId)) : 
        null;
      if (candidateId) {
        candidateVoteCounts.set(candidateId, (candidateVoteCounts.get(candidateId) || 0) + 1);
      }
    });
    
    console.log(`Vote counts by candidate:`, Object.fromEntries(candidateVoteCounts));
    
    // Map candidates with real vote counts from blockchain/database
    const candidatesWithRealVotes = election.candidates.map((candidate) => {
      const candidateId = candidate._id.toString();
      const realVoteCount = candidateVoteCounts.get(candidateId) || 0;
      
      return {
        id: candidateId,
        name: candidate.name,
        party: candidate.party,
        voteCount: realVoteCount, // Real vote count from Vote collection
      };
    });
    
    // Sort candidates by vote count (descending)
    candidatesWithRealVotes.sort((a, b) => b.voteCount - a.voteCount);
    
    // Calculate total votes
    const totalVotes = candidatesWithRealVotes.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    res.status(200).json({
      message: "Election results retrieved successfully",
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
        isCompleted: election.isCompleted,
        totalVotes: totalVotes,
        candidates: candidatesWithRealVotes.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          voteCount: candidate.voteCount // Real votes from Vote collection
        }))
      }
    });
  } catch (error) {
    console.error("Error getting election results:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving election results", error: error.message });
  }
});

// Get vote statistics for an election (MUST come before /votes route)
app.get("/api/elections/:electionId/votes/stats", async (req, res) => {
  try {
    const { electionId } = req.params;
    console.log(`📊 Vote stats request received: ${req.method} ${req.originalUrl}`);
    console.log(`   Election ID: ${electionId}`);
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the election
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Get all votes for this election
    let votes = [];
    try {
      votes = await Vote.find({ electionId });
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    // Count votes by candidate
    const candidateVoteCounts = new Map();
    votes.forEach(vote => {
      const candidateId = vote.candidateId ? 
        (vote.candidateId.toString ? vote.candidateId.toString() : String(vote.candidateId)) : 
        null;
      if (candidateId) {
        candidateVoteCounts.set(candidateId, (candidateVoteCounts.get(candidateId) || 0) + 1);
      }
    });
    
    // Get vote statistics by time
    const votesByHour = new Map();
    votes.forEach(vote => {
      const hour = new Date(vote.timestamp).getHours();
      votesByHour.set(hour, (votesByHour.get(hour) || 0) + 1);
    });
    
    // Get vote statistics by date
    const votesByDate = new Map();
    votes.forEach(vote => {
      const date = new Date(vote.timestamp).toISOString().split('T')[0];
      votesByDate.set(date, (votesByDate.get(date) || 0) + 1);
    });
    
    res.status(200).json({
      message: "Vote statistics retrieved successfully",
      election: {
        id: election._id.toString(),
        title: election.title
      },
      statistics: {
        totalVotes: votes.length,
        votesByCandidate: Object.fromEntries(
          election.candidates.map(candidate => {
            const candidateId = candidate._id.toString();
            return [candidate.name, candidateVoteCounts.get(candidateId) || 0];
          })
        ),
        votesByHour: Object.fromEntries(votesByHour),
        votesByDate: Object.fromEntries(votesByDate),
        firstVote: votes.length > 0 ? votes.sort((a, b) => a.timestamp - b.timestamp)[0].timestamp : null,
        lastVote: votes.length > 0 ? votes.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp : null
      }
    });
  } catch (error) {
    console.error("Error getting vote statistics:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving vote statistics", error: error.message });
  }
});

// Verify a specific vote in the blockchain (MUST come before /votes route)
app.get("/api/elections/:electionId/votes/verify/:voterId", async (req, res) => {
  try {
    const { electionId, voterId } = req.params;
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the vote
    let vote;
    try {
      vote = await Vote.findOne({ electionId, voterId });
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!vote) {
      return res.status(404).json({ 
        message: "Vote not found",
        hasVoted: false
      });
    }
    
    // Create voter hash (same as used when voting)
    const salt = process.env.VOTER_HASH_SALT || "votechain_secret_salt_2025";
    const voterHash = "0x" + crypto.createHash('sha256').update(voterId + salt).digest('hex');
    
    // Get election and candidate details
    const election = await Election.findById(electionId);
    const candidate = election ? election.candidates.id(vote.candidateId) : null;
    
    res.status(200).json({
      message: "Vote verified successfully",
      hasVoted: true,
      vote: {
        id: vote._id.toString(),
        electionId: vote.electionId.toString(),
        electionTitle: election ? election.title : "Unknown",
        candidateId: vote.candidateId.toString(),
        candidateName: candidate ? candidate.name : "Unknown",
        candidateParty: candidate ? candidate.party : "Unknown",
        voterHash: voterHash,
        timestamp: vote.timestamp,
        blockchainHash: vote.blockchainHash,
        createdAt: vote.createdAt
      }
    });
  } catch (error) {
    console.error("Error verifying vote:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while verifying vote", error: error.message });
  }
});

// Get vote bank (all votes) for an election from blockchain/database
app.get("/api/elections/:electionId/votes", async (req, res) => {
  try {
    const { electionId } = req.params;
    console.log(`🔗 Vote bank request received: ${req.method} ${req.originalUrl}`);
    console.log(`   Election ID: ${electionId}`);
    
    // Check if database is connected
    if (!isConnected()) {
      return res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection timeout"
      });
    }
    
    // Find the election
    let election;
    try {
      election = await Election.findById(electionId);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    // Get all votes for this election from the Vote collection (blockchain data)
    let votes = [];
    try {
      votes = await Vote.find({ electionId }).sort({ timestamp: -1 });
      console.log(`Found ${votes.length} votes in vote bank for election ${electionId}`);
    } catch (dbError) {
      const handled = handleDbError(dbError, res);
      if (handled) return;
      throw dbError;
    }
    
    // Format votes for response (anonymized - only show voterHash, not voterId)
    const voteBank = votes.map(vote => {
      // Create voter hash (same as used when voting)
      const salt = process.env.VOTER_HASH_SALT || "votechain_secret_salt_2025";
      const voterHash = "0x" + crypto.createHash('sha256').update(vote.voterId + salt).digest('hex');
      
      return {
        id: vote._id.toString(),
        electionId: vote.electionId.toString(),
        candidateId: vote.candidateId.toString(),
        voterHash: voterHash, // Anonymized voter identifier
        timestamp: vote.timestamp,
        blockchainHash: vote.blockchainHash,
        createdAt: vote.createdAt
      };
    });
    
    res.status(200).json({
      message: "Vote bank retrieved successfully",
      election: {
        id: election._id.toString(),
        title: election.title,
        description: election.description
      },
      totalVotes: voteBank.length,
      votes: voteBank
    });
  } catch (error) {
    console.error("Error getting vote bank:", error);
    const handled = handleDbError(error, res);
    if (handled) return;
    res.status(500).json({ message: "Server error while retrieving vote bank", error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend server is running" });
});

// 404 handler for undefined routes (MUST be last)
app.use("/api/*", (req, res) => {
  console.log(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`   Available vote bank routes:`);
  console.log(`   - GET /api/elections/:electionId/votes/stats`);
  console.log(`   - GET /api/elections/:electionId/votes/verify/:voterId`);
  console.log(`   - GET /api/elections/:electionId/votes`);
  res.status(404).json({ 
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
    hint: "Make sure the server has been restarted after adding new routes"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📡 API base URL: http://localhost:${PORT}/api`);
  console.log(`📋 Vote bank endpoints should be available at:`);
  console.log(`   GET /api/elections/:electionId/votes`);
  console.log(`   GET /api/elections/:electionId/votes/stats`);
  console.log(`   GET /api/elections/:electionId/votes/verify/:voterId`);
  console.log(`\n💡 If you see 404 errors, make sure:`);
  console.log(`   1. The server was restarted after adding routes`);
  console.log(`   2. The election ID is valid`);
  console.log(`   3. Check the console logs for route registration\n`);
});