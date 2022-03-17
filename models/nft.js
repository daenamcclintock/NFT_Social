/////////////////////////////////
// Import Dependencies
/////////////////////////////////
const mongoose = require('./connection')

// Import commentSchema
const commentSchema = require('./comment')

// Import user model so we can populate the info
const User = require('./user')

/////////////////////////////////
// Define NFT model
/////////////////////////////////
const { Schema, model } = mongoose

// make our NFT schema
const nftSchema = new Schema({
    name: { type: String },
    price: { type: Number },
    image: { type: String },
    scarcityScore: { type: Number },
    // Using user reference instead of username
    owner: {
        type: Schema.Types.ObjectID, // references the type 'objectId'
        ref: 'User' // references the model: 'User'
    },
    comments: [commentSchema] // use comment Schema
}, { timestamps: true }) // require timestamps for each comment

// Create NFT model
const Nft = model("Nft", nftSchema)

/////////////////////////////////
// Export NFT Model
/////////////////////////////////
module.exports = Nft