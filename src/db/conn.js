require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.w8m1b2p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
.then(()=>{
    console.log("connect to the database");
}).catch((e)=>{
    console.log(e);
});