import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["aadhaar", "face"], required: true },
    status: { type: String, enum: ["success", "failure"], required: true },
    message: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Verification ||
  mongoose.model("Verification", verificationSchema);
