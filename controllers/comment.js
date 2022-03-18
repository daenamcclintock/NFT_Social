////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const mongoose = require('mongoose')

// we need our NFT MODEL because comments are ONLY a schema
// so we'll run queries on NFTs, and add in comments
const Nft = require('../models/nft')

////////////////////////////////////////////
// Create router
////////////////////////////////////////////
const router = express.Router()

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
// only need two routes for comments right now
// POST -> to create a comment
router.post('/:nftId', (req, res) => {
    const nftId = req.params.nftId
    console.log('first comment body', req.body)
    
    // we'll adjust req.body to include an author
    // the author's id will be the logged in user's id
    req.body.author = req.session.userId
    console.log('updated comment body', req.body)
    // we'll find the nft with the nftId
    Nft.findById(nftId)
        .then(nft => {
            // then we'll send req.body to the comments array
            nft.comments.push(req.body)
            // save the nft
            return nft.save()
        })
        .then(nft => {
            // redirect
            res.redirect(`/nfts/${nft.id}`)
        })
        // or show an error if we have one
        .catch(error => {
            console.log(error)
            res.send(error)
        })
})

// DELETE -> to destroy a comment
// we'll use two params to make our life easier
// first the id of the nft, since we need to find it
// then the id of the comment, since we want to delete it
router.delete('/delete/:nftId/:commId', (req, res) => {
    // first we want to parse out our ids
    const nftId = req.params.nftId
    const commId = req.params.commId
    // then we'll find the nft
    Nft.findById(nftId)
        .then(nft => {
            const theComment = nft.comments.id(commId)
            // only delete the comment if the user who is logged in is the comment's author
            if ( theComment.author == req.session.userId) {
                // then we'll delete the comment
                theComment.remove()
                // return the saved NFT
                return nft.save()
            } else {
                return
            }

        })
        .then(nft => {
            // redirect to the nft show page
            res.redirect(`/nfts/${nftId}`)
        })
        .catch(error => {
            // catch any errors
            console.log(error)
            res.send(error)
        })
})

////////////////////////////////////////////
// Export the Router
////////////////////////////////////////////
module.exports = router