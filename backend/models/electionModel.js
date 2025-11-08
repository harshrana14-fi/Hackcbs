import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    electionType: {
      type: String,
      enum: ["lok-sabha", "state-assembly", "local", "municipal"],
      required: true,
    },
    state: { 
      type: String, 
      required: true,
      // This will be "national" for Lok Sabha elections
    },
    district: { 
      type: String, 
      // Required for local/municipal elections
    },
    constituency: { 
      type: String, 
      // Required for state-assembly elections
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    totalVotes: { type: Number, default: 0 },
    candidates: [
      {
        name: { type: String, required: true },
        party: { type: String, required: true },
        voteCount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Method to add a candidate
electionSchema.methods.addCandidate = function(candidateData) {
  this.candidates.push(candidateData);
  return this.save();
};

// Method to remove a candidate
electionSchema.methods.removeCandidate = function(candidateId) {
  // Try to match by _id first, then by string comparison
  this.candidates = this.candidates.filter(candidate => {
    // If candidate has an _id, compare with that
    if (candidate._id) {
      return candidate._id.toString() !== candidateId;
    }
    // Otherwise, we can't match this candidate
    return true;
  });
  return this.save();
};

// Method to end election
electionSchema.methods.endElection = function() {
  this.isActive = false;
  this.isCompleted = true;
  return this.save();
};

export default mongoose.models.Election || mongoose.model("Election", electionSchema);