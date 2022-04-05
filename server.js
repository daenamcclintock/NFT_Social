/////////////////////////////////
// Import Dependencies
/////////////////////////////////
require('dotenv').config()
const express = require('express')
const NftRouter = require('./controllers/nft')
const UserRouter = require('./controllers/user')
const HomeRouter = require('./controllers/home')
const CommentRouter = require('./controllers/comment')
const middleware = require('./utils/middleware')

////////////////////////////////////////////
// Create Express Application Object
////////////////////////////////////////////
// const app = require('liquid-express-views')(express())
const app = require("liquid-express-views")(express(), {root: process.cwd() + "/views/"});

////////////////////////////////////////////
// Middleware
////////////////////////////////////////////
middleware(app)

////////////////////////////////////////////
// Routes
////////////////////////////////////////////

// Send all '/nfts' routes to the Nft Router
app.use('/nfts', NftRouter)
app.use('/comments', CommentRouter)
app.use('/user', UserRouter)
app.use('/', HomeRouter)

////////////////////////////////////////////
// Server Listener
////////////////////////////////////////////
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`app is listening on port: ${PORT}`)
})