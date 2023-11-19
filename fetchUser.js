const jwt = require("jsonwebtoken");
require('dotenv').config();


const secretKey = process.env.JWT_KEY;

const fetchUser = (req,resp,next)=>{
    const token = req.header("auth-token");
    if(!token){
        resp.status(401).json({error : "Please authenticate using a valid token."})
    }
    try {
        // this returns the data from a jwt token
        const data = jwt.verify(token,secretKey);
        // fetching the user(struct) from received data
        // and assigning it to req.user 
        req.user = data.user;
        next();
    } catch (error) {
        resp.status(401).json({error : "Please authenticate using a valid token."})
    }
}

module.exports = fetchUser;