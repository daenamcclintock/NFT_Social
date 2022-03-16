// Import what I need
const { Schema, model } = require('./connection.js')

// Create the Schema
const UserSchema = new Schema(
	{
        firstName: {
            type: String, 
			required: true
        },
        lastName: {
            type: String, 
			required: true 
        },
		username: { 
			type: String, 
			required: true,
			unique: true 
		},
		password: { 
			type: String, 
			required: true
		}
	},
	{ timestamps: true }
)

// Create the model
const User = model('User', UserSchema)

// Export the model
module.exports = User