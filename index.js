require("./config");
const express = require("express");
// importing cors 
var cors = require('cors');

const app = express();
const port = 3700;

// cors middleware to allow access to perform all CURD from all ports
// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', "*");
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// }

// parsing all json resonses
app.use(express.json());
// using cors 
app.use(cors());

app.use("/api/auth",require("./routes/auth"));
app.use("/api/notes",require("./routes/notes"));
 
app.listen(port,()=>{
    console.log(`listening at port no. ${port}`)
})

// models -> make models using schema -> #44 10:15