const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser")
require('dotenv').config() ;


const secretKey = process.env.JWT_KEY;


// ROUTE 1 : REGISTER USER (Sign Up) [/api/auth/createUsers]
// No login required
router.post("/createUser",[
    // using express validations (inside an array as middleware)
body("name","Name must be atleast 3 characters.").isLength({min:3}),
body("email","Enter a valid email.").isEmail(),
body("password","Password must be atleast 5 characters.").isLength({min:5})],

async(req,resp)=>{
    // traking success
    let success = false;

    // if error (bad request) ..then show whats wrong
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return resp.status(400).json({ success,errors: errors.array() });
    }
    // if no error
    // entering data into database form req body
    try {
        // checking if email already exists in db
        let user = await User.findOne({email : req.body.email});
        // if exists, then show error (user will not be null)
        if(user){
            return resp.status(400).json({success,error : "This email already exists."});
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt)
        // if email is new, then create user 
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })

        // getting id of submitted data 
        const data = {
            user : {
                id : user.id
            }
        }

        // getting token using id 
        const authToken = jwt.sign(data,secretKey);
        console.log(authToken);
        // send user as resp if everything goes well
        success = true;
        resp.json({success,authToken});

        // or if some unexpected error occurs, handle it
    } catch (error) {
        console.error(error.message);
        resp.status(500).json({success,error :"some error occured !"})
    }

})




// ROUTE 2 : LOGIN USER (Sign in) [api/auth/login]
// authenticate a user (are they authentic ? ) and gives them token
router.post("/login",[
 body("email","Enter a valid email !").isEmail(),
 body("password","Password must be atleast 5 characters.").isLength({min:5})
],async (req,resp)=>{
    //success status 
    let success = false;

    // checking for errors
    const error = validationResult(req);
    if(!error.isEmpty()){
        return resp.status(400).json({success,error : error.array()});
    }

    // if no error
    // destructuring the email and password 
    const {email, password} = req.body;
    try {
        // check for email in database
        const user = await User.findOne({email});
        if(!user){
            return resp.status(400).json({success,error : "Invalid username or password."}); 
        }
        // compare paassword entered in req.body with the actual password in db
        const passCompare = await bcrypt.compare(password, user.password);
        if(!passCompare){
            return resp.status(400).json({success,error : "Invalid username or password."});
        }

        // if everything goes well...then...
        // getting hold of user id
        success = true;
        const data = {
            user : {
                id : user.id
            }
        }

        // generating token based on that id
        const authToken = jwt.sign(data,secretKey);
      
        // send authToken as resp if everything goes well
        resp.json({success,authToken});


    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error occured !")
    }

})



// ROUTE 3 : get loggedIn details [/api/auth/getUser]
// Login required before it (auth token required)
router.post("/getUser",fetchUser, async(req,resp)=>{
    try {
    // storing info into req.user after decoding token using the middleware above
    // and accessing the id from it
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        resp.send(user);

    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error occured !")
    }
})



module.exports = router;



