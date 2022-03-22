/////////////////////////////////
// import dependencies
/////////////////////////////////
require('dotenv').config()
const mongoose = require('mongoose')

// Connect to the Database
// LOCAL DATABASE CONNECTION => process.env.DATABASE_URL
// REMOTE DATABASE CONNECTION => process.env.MONGODB_URI

/////////////////////////////////
// database connection
/////////////////////////////////
// here we are setting up inputs for our connect function
const MONGODB_URI = process.env.MONGODB_URI
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// establish connection
mongoose.connect(MONGODB_URI, CONFIG)

// events for when our connection opens/closes/errors
mongoose.connection
	.on('open', () => console.log(`Mongoose connected to ${mongoose.connection.host}:${mongoose.connection.port}`))
	.on('close', () => console.log(`Disconnected from ${mongoose.connection.host}:${mongoose.connection.port}`))
	.on('error', (error) => console.log(error))

/////////////////////////////////
// export our connection
/////////////////////////////////
module.exports = mongoose