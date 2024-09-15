import mongoose from "mongoose";

const otpModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // OTP expires after 2 minutes
  },
});

export default mongoose.model("otp", otpModel);
