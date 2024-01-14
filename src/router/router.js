require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const User = require("../models/personal-details");
const OTP = require("../models/otpModel");


const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;



const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "rocio.weissnat86@ethereal.email",
    pass: "PeD6M87NvzBXs9ybPA",
  }
});


function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}

router.post("/createUser", async (req, res) => {
  try {

    const { firstName, email, dateOfBirth, gender, mobileNumber, houseNo, city, state, pinCode, referralCode, schoolName, className, board, subjects } = req.body;
    //console.log(req.body);

    const existingUser = await User.findOne({ $or: [{ mobileNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User is already registered" });
    }

    if (!firstName || !email || !dateOfBirth || !gender || !mobileNumber || !houseNo || !city || !state || !pinCode || !schoolName || !className || !board || !subjects) {
      return res.status(400).json({ message: "all the fields are required" });
    }


    const user = new User({
      firstName, email, dateOfBirth, gender, mobileNumber, houseNo, city, state, pinCode, referralCode, schoolName, className, board, subjects
    });

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Internal Server Error" });
  }
});


router.post("/send-otp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }

    const otpValue = generateOTP();

    const otpRecord = new OTP({
      user: user._id,
      otp: otpValue,
    });

    await otpRecord.save();

    await twilioClient.messages.create({
      body: `Your OTP for verification is: ${otpValue}`,
      to: `+91${mobileNumber}`,
      from: twilioPhoneNumber,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    const otpRecord = await OTP.findOne({ user: user._id, otp }).sort({ _id: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Mismatched OTP" });
    }

    if (otpRecord.timer < 0) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.status = "Verified";
    await user.save();

    await OTP.findByIdAndDelete(otpRecord._id);

    res.status(200).json({ user, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

router.post("/email/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }

    const otpValue = generateOTP();

    const otpRecord = new OTP({
      user: user._id,
      otp: otpValue,
    });

    await otpRecord.save();

    const mailOptions = {
      from: "<rocio.weissnat86@ethereal.email>",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otpValue}`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ message: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).send({ message: "OTP sent successfully", messageId: info.messageId  });
      }
    });

    //res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

router.post("/email/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    const otpRecord = await OTP.findOne({ user: user._id, otp }).sort({ _id: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.timer < 0) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.status = "Verified";
    await user.save();

    await OTP.findByIdAndDelete(otpRecord._id);

    res.status(200).json({ user, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = router;