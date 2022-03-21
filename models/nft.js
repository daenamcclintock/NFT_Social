/////////////////////////////////
// import dependencies
/////////////////////////////////
const mongoose = require('./connection')

// we also need to import our commentSchema
const commentSchema = require('./comment')

// we'll import our user model so we can populate the info
const User = require('./user')

/////////////////////////////////
// define our NFTs model
/////////////////////////////////
// pull the schema and model constructors from mongoose
// we're going to use something called destructuring to accomplish this
const { Schema, model } = mongoose

// make our NFT schema
const nftSchema = new Schema({
    name: { type: String },
    img: { type: String },
    scarcityScore: { type: Number },
    openSeaLink: { type: String},
    // Using user reference instead of username
    owner: {
        type: Schema.Types.ObjectID, // references the type 'objectId'
        ref: 'User' // references the model: 'User'
    },
    comments: [commentSchema] // use comment Schema
}, { timestamps: true }) // require timestamps for each comment

// make our NFT model
const Nft = model("Nft", nftSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Nft