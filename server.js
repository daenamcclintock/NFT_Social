////////////////////
//  Dependencies  //
////////////////////
require("dotenv").config() // make env variables available
const express = require("express")
const middleware = require('./utils/middleware')
const NftRouter = require('./controllers/nft')
const UserRouter = require('./controllers/user')
const User = require("./models/user")
const Moralis = require('moralis/node')
// SEE MORE DEPENDENCIES IN ./utils/middleware.js
// User and Resource routes linked in ./utils/middleware.js

//////////////////////////////
// Middleware + App Object  //
//////////////////////////////
const app = require("liquid-express-views")(express())

middleware(app)

////////////////////
//    Routes      //
////////////////////

app.use('/auth', UserRouter)
app.use('/nft', NftRouter)

app.get('/', (req, res) => {
    const { username, userId, loggedIn } = req.session
	res.render('index.liquid', { loggedIn, username, userId })
})

app.get('/error', (req, res) => {
	const error = req.query.error || 'This Page Does Not Exist'
    const { username, loggedIn, userId } = req.session
	res.render('error.liquid', { error, username, loggedIn, userId })
})

// If page is not found, send to error page
app.all('*', (req, res) => {
	res.redirect('/error')
})

async function nft() {
const options = { q: "Pancake", chain: "bsc", filter: "name" };
const NFTs = await Moralis.Web3API.token.searchNFTs(options);
console.log(NFTs);
}

//////////////////////////////
//      App Listener        //
//////////////////////////////
app.listen(process.env.PORT, () => {
    console.log(`listening on Port ${process.env.PORT}`)
    console.log(nft())
})