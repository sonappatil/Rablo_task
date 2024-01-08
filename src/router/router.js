const express = require("express");
const PersonalDetail = require("../models/personal-details");
const OTP = require("../models/otpModel");

const router = express.Router();

router.post("/personal" , async(req,res)=>{
    try {
        //req.body.dateOfBirth = new Date(req.body.dateOfBirth);
        const {firstName,dateOfBirth,gender,guardianMobile,houseNo,city,state,pinCode,referralCode,schoolName,className,board,subjects} = req.body;
        console.log(req.body);
        if(!firstName || !dateOfBirth ||!gender || !guardianMobile ||!houseNo || !city ||!state || !pinCode || !schoolName || !className ||!board || !subjects){
            return res.status(400).json({message: "all the fields are required"});
         }
         const personalDetail = new PersonalDetail({
            firstName,dateOfBirth,gender,guardianMobile,houseNo,city,state,pinCode,referralCode,schoolName,className,board,subjects
         });
         await personalDetail.save();
         res.status(201).send(personalDetail);
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"Internal Server Error"});
    }
});


router.post("/send-otp/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await PersonalDetail.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      
      function generateOTP() {
        const otp = Math.floor(1000 + Math.random() * 9000);
        return otp.toString();
      }
      const generatedOTP = generateOTP(); 
  
     
      const otp = new OTP({
        user: userId,
        otp: generatedOTP,
      });
  
      await otp.save();
  
      res.json({ otp: generatedOTP });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // Verify OTP
  router.post("/verify-otp/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const enteredOTP = req.body.otp;
  
      
      const user = await PersonalDetail.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      
      const latestOTP = await OTP.findOne({ user: userId }).sort({ _id: -1 });
  
      // Check if the OTP is correct
      if (!latestOTP || latestOTP.otp !== enteredOTP) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
  
      //(check expiration)
      if (latestOTP.timer <= 0) {
        return res.status(401).json({ message: "OTP has expired" });
      }
  
      // update user status
      user.status = "Verified"; 
      await user.save();
  
      // Delete the used OTP
      await OTP.deleteOne({ _id: latestOTP._id });
  
      res.json({ message: "Mobile number verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });



// router.post("/address" , async(req,res)=>{
//     try {
//         const {houseNo,city,state,pinCode,referralCode} = req.body;
//         if(!houseNo || !city ||!state || !pinCode ){
//             return res.status(400).json({message: "all the fields are required"});
//          }
//          const addressDetail = new AddressDetail({
//             houseNo,city,state,pinCode,referralCode
//          });
//          await addressDetail.save();
//          res.status(201).send(addressDetail);
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({message:"Internal Server Error"});
//     }
// });

// router.post("/academic" , async(req,res)=>{
//     try {
//         const {schoolName,className,board,subjects} = req.body;
//         if(!schoolName || !className ||!board || !subjects ){
//             return res.status(400).json({message: "all the fields are required"});
//          }
//          const academicDetail = new AcademicDetail({
//             schoolName,className,board,subjects
//          });
//          await academicDetail.save();
//          res.status(201).send(academicDetail);
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({message:"Internal Server Error"});
//     }
// });

module.exports = router;