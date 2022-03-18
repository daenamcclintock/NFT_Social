/////////////////////////////////
// import dependencies
/////////////////////////////////
// this allows us to load our env variables
require('dotenv').config()
const express = require('express')
// We no longer need this reference because it lives in the nft controller now
// const Nft = require('./models/nft')
// now that we're using controllers as they should be used
// we need to require our routers
const NftRouter = require('./controllers/nft')
const UserRouter = require('./controllers/user')
const HomeRouter = require('./controllers/home')
const CommentRouter = require('./controllers/comment')
const middleware = require('./utils/middleware')

////////////////////////////////////////////
// Create our express application object
////////////////////////////////////////////
const app = require('liquid-express-views')(express())

////////////////////////////////////////////
// Middleware
////////////////////////////////////////////
middleware(app)

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
// register our routes here
// send all '/nfts' routes to the Nft Router
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