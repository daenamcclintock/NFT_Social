// Make our .env variables available via process.env
require('dotenv').config()

// Import mongoose
const mongoose = require('mongoose')

// Connect to the database
mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
	useNewUrlParser: true,
})

// Save the connection in a variable
const db = mongoose.connection

// Create some notification
db.on('open', () => console.log('You are connected to mongo'))
db.on('close', () => console.log('You are disconnected from mongo'))
db.on('error', (error) => console.log(error))

// Export the connection
module.exports = mongoose