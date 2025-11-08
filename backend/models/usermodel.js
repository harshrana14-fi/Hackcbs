import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["candidate", "recruiter", "voter"], required: true },

    // Aadhaar & Face verification
    isAadhaarVerified: { type: Boolean, default: false },
    isFaceVerified: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Voter ID
    voterId: { type: String, unique: true, sparse: true },

    kycRef: { type: mongoose.Schema.Types.ObjectId, ref: "Kyc" },
    
    // Votes
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);