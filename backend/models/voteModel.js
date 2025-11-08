import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Store the voter's state at the time of voting for eligibility verification
    voterState: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Blockchain transaction hash
    blockchainHash: { type: String },
  },
  { timestamps: true }
);

// Ensure a voter can only vote once per election
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", voteSchema);