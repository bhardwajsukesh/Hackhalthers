const mongoose = require("mongoose");
const database = "cloud-notes";
const uri = `mongodb://localhost:27017/${database}`
mongoose.connect(uri,()=>{
    console.log("Connected to cloud-notes successfully !")
});