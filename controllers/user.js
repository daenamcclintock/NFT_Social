////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

////////////////////////////////////////////
// Create Router
////////////////////////////////////////////
const router = express.Router()


////////////////////////////////////////////
// Routes
////////////////////////////////////////////

// GET to render the signup form
router.get('/signup', (req, res) => {
	res.render('auth/signup')
})

// POST to send the signup info
router.post('/signup', async (req, res) => {
	// set the password to hashed password
  req.body.password = await bcrypt.hash(
		req.body.password,
		await bcrypt.genSalt(10)
	)
	// Create a new user
	User.create(req.body)
		// if created successfully redirect to login
		.then((user) => {
			res.redirect('/auth/login')
		})
		// if an error occurs, send err
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// Two login routes
// GET to render the login form
router.get('/login', (req, res) => {
	res.render('auth/login')
})

// POST to send the login info(and create a session)
router.post('/login', async (req, res) => {
	// console.log('request object', req)
	// get the data from the request body
	console.log('req.body', req.body);
	
	const { username, password } = req.body
	// then we search for the user
	User.findOne({ username: username })
		.then(async (user) => {
			// check if the user exists
			if (user) {
				// compare the password
				// bcrypt.compare evaluates to a truthy or a falsy value
				const result = await bcrypt.compare(password, user.password)

				if (result) {
					console.log('the user', user);
					
					// store some properties in the session
					req.session.username = user.username
                    req.session.firstName = user.firstName
                    req.session.lastName = user.lastName
					req.session.loggedIn = true
					req.session.userId = user.id

          			const { username, firstName, lastName, loggedIn, userId } = req.session

					console.log('session user id', req.session.userId)
					// redirect to /examples if login is successful
					res.redirect('/')
				} else {
					// send an error if the password doesnt match
					res.redirect('/error?error=incorrect%20username%20or%20password')
				}
			} else {
				// send an error if the user doesnt exist
				res.redirect('/error?error=User%20does%20not%20exist')
			}
		})
		// catch any other errors that occur
		.catch((error) => {
			console.log('the error', error);
			
			res.redirect(`/error?error=${error}`)
		})
})

// Logout Route -> Destroy the Session
router.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/')
	})
})

// Export the Router
module.exports = router