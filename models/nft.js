/////////////////////////////////
// Import Dependencies
/////////////////////////////////
const mongoose = require('./connection')

// Also need to import our commentSchema
const commentSchema = require('./comment')

// We'll import our user model so we can populate the info
const User = require('./user')

/////////////////////////////////
// Define our NFT model
/////////////////////////////////
// pull the schema and model constructors from mongoose
// we're going to use something called destructuring to accomplish this
const { Schema, model } = mongoose

// make our NFT schema
const nftSchema = new Schema({
    name: { type: String },
    color: { type: String },
    readyToEat: { type: Boolean },
    // instead of username, we're going to use a reference
    owner: {
        // references the type 'objectId'
        type: Schema.Types.ObjectID,
        // references the model: 'User'
        ref: 'User'
        // now that we have an owner field, let's look and replace references to the username in our NFT controllers
    },
    comments: [commentSchema]
}, { timestamps: true })

// make our fruit model
const Fruit = model("Fruit", nftSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Fruit