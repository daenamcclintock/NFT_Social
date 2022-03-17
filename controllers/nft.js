////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const Nft = require('../models/nft')
import fetch from 'node-fetch';

////////////////////////////////////////////
// Create router
////////////////////////////////////////////
const router = express.Router()

////////////////////////////////////////////
// Router Middleware
////////////////////////////////////////////
// create some middleware to protect these routes
// Authorization middleware
router.use((req, res, next) => {
	// checking the loggedin boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/user/login')
	}
})

////////////////////////////////////////////
// Routes
////////////////////////////////////////////

// index ALL nfts route
router.get('/', (req, res) => {
	// find the nfts
	Nft.find({})
		// then render a template AFTER they're found
		.then((nfts) => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			// console.log(nfts)
			res.render('nfts/index', { nfts, username, loggedIn })
		})
		// show an error if there is one
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

// index that shows only the user's nfts
router.get('/mine', (req, res) => {
	// find the nfts
	Nft.find({ owner: req.session.userId })
		// then render a template AFTER they're found
		.then((nfts) => {
			// console.log(nfts)
			const username = req.session.username
			const loggedIn = req.session.loggedIn

			res.render('nfts/index', { nfts, username, loggedIn })
		})
		// show an error if there is one
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const username = req.session.username
	const loggedIn = req.session.loggedIn
	res.render('nfts/new', { username, loggedIn })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	// check if the readyToEat property should be true or false
	// we can check AND set this property in one line of code
	// first part sets the property name
	// second is a ternary to set the value
	req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
	// console.log('this is the nft to create', req.body)
	// now we're ready for mongoose to do its thing
	// now that we have user specific nfts, we'll add the username to the fruit created
	// req.body.username = req.session.username
	// instead of a username, we're now using a reference
	// and since we've stored the id of the user in the session object, we can use it to set the owner property of the fruit upon creation.
	req.body.owner = req.session.userId
	Nft.create(req.body)
		.then((nft) => {
			console.log('this was returned from create', nft)
			res.redirect('/nfts')
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const nftId = req.params.id
	// find the nft
	Nft.findById(nftId)
		// -->render if there is an nft
		.then((nft) => {
			console.log('edit froot', nft)
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			res.render('nfts/edit', { nft, username, loggedIn })
		})
		// -->error if no nft
		.catch((err) => {
			console.log(err)
			res.json(err)
		})
})

// update route -> sends a put request to our database
router.put('/:id', (req, res) => {
	// get the id
	const nftId = req.params.id
	// check and assign the readyToEat property with the correct value
	req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
	// tell mongoose to update the fruit
	Fruit.findByIdAndUpdate(fruitId, req.body, { new: true })
		// if successful -> redirect to the fruit page
		.then((fruit) => {
			console.log('the updated fruit', fruit)

			res.redirect(`/fruits/${fruit.id}`)
		})
		// if an error, display that
		.catch((error) => res.json(error))
})

// show route
router.get('/:id', (req, res) => {
	// first, we need to get the id
	const fruitId = req.params.id
	// then we can find a fruit by its id
	Fruit.findById(fruitId)
		.populate('comments.author')
		// once found, we can render a view with the data
		.then((fruit) => {
			console.log('the fruit we got\n', fruit)
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			res.render('fruits/show', { fruit, username, loggedIn, userId })
		})
		// if there is an error, show that instead
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// delete route
router.delete('/:id', (req, res) => {
	// get the fruit id
	const fruitId = req.params.id
	// delete the fruit
	Fruit.findByIdAndRemove(fruitId)
		.then((fruit) => {
			console.log('this is the response from FBID', fruit)
			res.redirect('/fruits')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})
////////////////////////////////////////////
// Export the Router
////////////////////////////////////////////
module.exports = router