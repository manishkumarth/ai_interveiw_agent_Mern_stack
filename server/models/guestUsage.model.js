import mongoose from "mongoose";

const guestUsageSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GuestUsage = mongoose.model("GuestUsage", guestUsageSchema);

export default GuestUsage;

