const express = require('express');
require("./db/conn");
const cors = require('cors');
const router = require("./router/router");


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(router);

app.listen(port,()=>{
    console.log(`listen to the ${port}`);
})
