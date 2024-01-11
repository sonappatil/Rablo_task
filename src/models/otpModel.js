// otpModel.js

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  timer: {
    type: Number,
    default: 600, 
  },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
