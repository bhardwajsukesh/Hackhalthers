const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes")
const router = express.Router();
const { body, validationResult } = require('express-validator');


// ROUTE 1 : GET all notes [/api/notes/fetchallnotes]
// prior login required (auth token required)
router.get("/fetchallnotes",fetchUser,async(req,resp)=>{
    try {
        const notes = await Notes.find({user : req.user.id});
        resp.json(notes);
    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error .")
    }
})

// ROUTE 2 : using POST to add new notes [/api/notes/addnote]
// prior login required (auth token required)
router.post("/addnote",fetchUser,[
  body("title","Please enter a title").exists(),
  body("description","Description must be atleast 5 characters.").isLength({min:5})
  ],async(req,resp)=>{
    try {
        // destructuring req.body items
        const {title, description, tag} = req.body;

         // if error (bad request) ..then show whats wrong
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
        }

        // if not error ..continue (enter note in db)

        // setting user = user id [taken from jwt token]
        // as fetchUser function assigns user values to req.user
        const note = new Notes({title,description,tag ,user : req.user.id});
        const savedNote = await note.save();
        resp.json(savedNote);

    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error .")
    }
})


//ROUTE 3 : PUT : Update existing note (using note id) [/api/notes/updatenote]
// Login required (auth token required)
router.put("/updatenote/:id",fetchUser,async(req,resp)=>{
    //destructuring
    const {title, description, tag} = req.body;

    try {
        // create a new note object from req body
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        // getting hold on note to be updated ..by its id
        const currentNote = await Notes.findById(req.params.id);
        if(!currentNote){
            return resp.status(404).json({error : "Note not found."});
        }
        // making sure that user id of note = id of currently logged user
        if(currentNote.user.toString() !== req.user.id){
            return resp.status(401).json({error : "Not allowed."});
        }


        // now finally updating note
        const updatedNote = await Notes.findByIdAndUpdate(req.params.id,{$set : newNote},{new: true});
        // {new: true} used to get updated note and not old one
        resp.json(updatedNote);


    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error .")
    }
})


// ROUTE 4 : DELETE : delete existing note      [/api/notes/deletenote]
// prior login required (auth-token required)
router.delete("/deletenote/:id",fetchUser,async(req,resp)=>{
    try {
        // getting hold on note to be deleted ..by its id
        const currentNote = await Notes.findById(req.params.id);
        if(!currentNote){
            return resp.status(404).json({error : "Note not found."});
        }
        // making sure that user id of note = id of currently logged user
        if(currentNote.user.toString() !== req.user.id){
            return resp.status(401).json({error : "Not allowed."});
        }

        // finally deleting the note 
        const deletedNote = await Notes.findByIdAndDelete(req.params.id);
        if(deletedNote){
            resp.json({Success : "Note has been deleted .",deletedNote});
        }

    } catch (error) {
        console.error(error.message);
        resp.status(500).send("Internal server error .")
    }
})


module.exports = router;