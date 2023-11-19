const mongoose = require("mongoose");
const collection = "notes";

const currentSchema = new mongoose.Schema({
    // creating space to store user for every note
    user : {
        type : mongoose.Schema.Types.ObjectId,  // type is id
        ref : "users",   // same as sql joins // refering to collection "users"
        index : true  
        // above (index : true) is used to avoid an error 👇🏻
        // Cast to ObjectId failed for value "undefined" (type string) at path "_id" for model "notes"

    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    tag : {
        type : String,
        default : "General"
    },
    date : {
        type : Date,
        default : Date.now
    }
})

const model = mongoose.model(collection,currentSchema);

module.exports = model;