const mongoose = require("mongoose");

const personalDetailsSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
    set: function (value) {
      // Parse the date from "DD-MM-YYYY" format
      const parts = value.split('-');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    },
  },
  gender: {
    type: String,
    required: true
  },
  guardianMobile: {
    type: String,
    required: true,
    maxlength: 10
  },

  houseNo: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pinCode: {
    type: String,
    required: true
  },
  referralCode: {
    type: String
  },

  schoolName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  board: {
    type: String,
    required: true
  },
  subjects: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    default: "Active"
}
})

const PersonalDetail = mongoose.model("PersonalDetail", personalDetailsSchema);

module.exports = PersonalDetail;