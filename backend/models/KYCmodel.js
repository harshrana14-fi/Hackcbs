import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    aadhaarNumber: { type: String, required: true },
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarDetails: {
      name: String,
      dob: String,
      gender: String,
      address: String,
    },

    // Address details
    presentAddress: {
      houseNumber: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" }
    },
    permanentAddress: {
      houseNumber: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" }
    },
    isSameAsPermanent: { type: Boolean, default: false },
    
    // Address proof
    addressProofType: {
      type: String,
      enum: ["aadhaar", "passport", "driving_license", "voter_id", "bank_statement", "rent_agreement", "other"]
    },
    addressProofDocument: String, // base64 encoded image or file path

    faceImages: [String], // base64 images from MediaPipe
    faceVerified: { type: Boolean, default: false },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    remarks: { type: String },
    district: { type: String },
    constituency: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Kyc || mongoose.model("Kyc", kycSchema);