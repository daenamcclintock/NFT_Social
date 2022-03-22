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
    req.body.author = req.session.userId
    console.log('updated comment body', req.body)
    Nft.findById(nftId)
        .then(nft => {
            nft.comments.push(req.body)
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
router.delete('/delete/:nftId/:commId', (req, res) => {
    const nftId = req.params.nftId
    const commId = req.params.commId
    Nft.findById(nftId)
        .then(nft => {
            const theComment = nft.comments.id(commId)
            if ( theComment.author == req.session.userId) {
                theComment.remove()
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