import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organization: { type: String, required: true },
    department: { 
      type: String, 
      required: true,
      enum: ["election-management", "voter-registration", "technology", "security", "compliance", "other"]
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);