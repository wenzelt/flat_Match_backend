import { Schema } from "mongoose"
import mongoose from "mongoose"
// @ts-ignore
import uniqueValidator = require("mongoose-unique-validator")
import validator from 'validator'

// used this for guidance: https://thinkster.io/tutorials/node-json-api/creating-the-user-model

const userType = {
	discriminatorKey: 'userType'
}

// Define the user schema
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Email is invalid"],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
		minlength: 8,
		// select: false,  // never send Pw to the frontend
	},
	full_name: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		enum: ["Male", "Female", "Prefer not to say"]
	},
	image: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: "Image"
		}],
		required: true,
		validate: [arrayLimit, '{PATH} exceeds the limit of 20']
	},
	bio: {
		type: String,
		required: true,
	},
	date_of_birth: {
		type: Date,
		required: true,

	},
	occupation: {
		type: String,
	},
	place_of_residency: {
		country: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		zipCode: {
			type: String,
			required: true
		},
		address: String,

	},
	interests: [{
		type: String,
		required: true
	}],
}, userType)

// Limit number of pictures to 20
function arrayLimit(val: any) {
	return val.length <= 20
}

userSchema.plugin(uniqueValidator, { message: 'is already taken.' })

// Export the model
const User = mongoose.model("User", userSchema)
export { User, userType }


