import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import { User } from "../models/user"
import { Applicant } from "../models/applicant"
import { Tenant } from "../models/tenant"
import { Filter } from "../models/filter"
import { HousingOffer } from "../models/housingOffer"

const signup = async (req: any, res: any) => {
	// check if applicant or tenant
	try {
		if (process.env.JWT_SECRET === '' || process.env.JWT_SECRET === undefined ||
			process.env.JWT_SECRET === null) throw new Error("JWT Secret not found")

		if (req.body.userType.discriminatorKey === "Applicant") {

			// hash the password before storing it in the database
			const hashedPassword1 = bcrypt.hashSync(req.body.password, 12)

			// create a user object
			const applicant = new Applicant({
				email: req.body.email,
				password: hashedPassword1,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				gender: req.body.gender,
				bio: req.body.bio,
				date_of_birth: req.body.date_of_birth,
				occupation: req.body.occupation,
				place_of_residency: req.body.place_of_residency,
				interests: req.body.interests,
				smoker: req.body.smoker,
				declined_offers: req.body.declined_offers,
				accepted_offers: req.body.accepted_offers,
				userType: req.body.userType.discriminatorKey
			})
			// create the applicant in the database

			const retUser = await User.create(applicant)

			// if applicant is registered without errors
			// create a token
			const token = jwt.sign(
				{
					_id: retUser._id
				},
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, // expires in 24 hours
				}
			)

			res.status(200).json({
				token,
			})

		} else {
			// hash the password before storing it in the database
			const hashedPassword2 = bcrypt.hashSync(req.body.password, 12)

			const tenant = new Tenant({
				email: req.body.email,
				password: hashedPassword2,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				gender: req.body.gender,
				bio: req.body.bio,
				date_of_birth: req.body.date_of_birth,
				occupation: req.body.occupation,
				place_of_residency: req.body.place_of_residency,
				interests: req.body.interests,
				declined_applicants: req.body.declined_applicants,
				accepted_applicants: req.body.accepted_applicants,
				userType: req.body.userType.discriminatorKey
			})
			// create the tenant in the database
			const retUser: any = await User.create(tenant)

			// if tenant is registered without errors
			// create a token
			const token = jwt.sign(
				{
					_id: retUser._id, first_name: retUser.first_name, last_name: retUser.last_name
				},
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, // expires in 24 hours
				}
			)
			res.status(200).json({
				token,
			})
		}
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({
				error: "User exists",
				message: err.message,
			})
		} else {
			return res.status(500).json({
				error: "Internal server error",
				message: err.message,
			})
		}
	}
}


const signin = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (!Object.prototype.hasOwnProperty.call(req.body, "password"))
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body must contain a password property",
		})

	if (!Object.prototype.hasOwnProperty.call(req.body, "email"))
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body must contain a username property",
		})

	// handle the request
	try {
		// get the user form the database
		let user: any
		user = await User.findOne({
			email: req.body.email,
		}).exec()

		// check if a user with the given email exists
		if (user === null || user === undefined) {
			return res.status(401).send({ token: null })
		}

		// check if the password is valid
		const isPasswordValid = bcrypt.compareSync(
			req.body.password,
			user.password
		)
		if (!isPasswordValid) return res.status(401).send({ token: null })

		// if user is found and password is valid
		// create a token
		const token = jwt.sign(
			{ _id: user._id, first_name: user.first_name, last_name: user.last_name },
			process.env.JWT_SECRET,
			{
				expiresIn: 86400, // expires in 24 hours
			}
		)

		return res.status(200).json({
			token,
		})
	} catch (err) {
		return res.status(404).json({
			error: "User Not Found",
			message: err.message,
		})
	}
}

const getUser = async (req: any, res: any) => {
	try {
		// get own user info from database
		const user = await User.findById(req.userId)
			.select('-password')
			.exec()

		if (!user)
			return res.status(404).json({
				error: "Not Found",
				message: `User not found`,
			})

		return res.status(200).json(user)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const getUserByMail = async (req: any, res: any) => {
	try {
		// for an input array of emails, return an array of users
		const user = await User.findOne({ email: req.params.email })
			.select('-password')
			.exec()

		if (!user)
			return res.status(404).json({
				error: "Not Found",
				message: `User not found`,
			})

		return res.status(200).json(user)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const isEmailAvailable = async (req: any, res: any) => {
	try {
		const filter = { email: req.params.email }
		const userFound = await User.findOne(filter)

		if (userFound !== null && userFound !== undefined) {
			return res.status(200).json(false)
		}

		return res.status(200).json(true)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const updateUser = async (req: any, res: any) => {
	try {
		const user: any = await User.findById(req.userId)
		const filter = { _id: req.userId }
		const update = {
			smoker: req.body.smoker,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			gender: req.body.gender,
			bio: req.body.bio,
			date_of_birth: req.body.date_of_birth,
			occupation: req.body.occupation,
			place_of_residency: req.body.place_of_residency,
			interests: req.body.interests,
		}
		let updatedUser
		if (user.userType === "Tenant") {
			updatedUser = await Tenant.findOneAndUpdate(filter, update, {
				runValidators: true,
				new: true
			})
		} else {
			updatedUser = await Applicant.findOneAndUpdate(filter, update, {
				runValidators: true,
				new: true
			})
		}

		if (!updatedUser)
			return res.status(404).json({
				error: "Not Found",
				message: `User not found`,
			})

		return res.status(200).json(updatedUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal server error",
			message: err.message,
		})
	}
}

const logout = (req: any, res: any) => {
	res.status(200).send({ token: null })
}

const deleteAccount = async (req: any, res: any) => {
	try {
		// Delete filter
		await Filter.deleteOne({ applicant: req.userId })

		const housingOffers = await HousingOffer.find({ tenant: req.userId })
		if (housingOffers.length !== 0) {
			const gfsOffer = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
				bucketName: 'offerPictures'
			})
			// Delete offerPictures
			housingOffers.map(async (housingOffer) => {
				const offerFiles = await gfsOffer.find({ filename: { $regex: housingOffer._id + '.*' } }).toArray()
				offerFiles.map(async (fileToDelete) => {
					const file = await gfsOffer.find({ filename: fileToDelete.filename }).toArray()
					if (file.length > 0) {
						await gfsOffer.delete(file[0]._id)
					}
				})
			})
			// Delete offers
			await HousingOffer.deleteMany({ tenant: req.userId })
		}

		// Delete profilePictures
		const gfsProfile = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'profilePictures'
		})
		const profileFiles = await gfsProfile.find({ filename: { $regex: req.userId + '.*' } }).toArray()
		profileFiles.map(async (fileToDelete) => {
			const file = await gfsProfile.find({ filename: fileToDelete.filename }).toArray()
			if (file.length > 0) {
				await gfsProfile.delete(file[0]._id)
			}
		})
		// Delete user
		await User.findByIdAndDelete(req.userId)
		return res.status(200).json(true)
	} catch (error) {
		return res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
}


export {
	signup,
	signin,
	getUser,
	logout,
	updateUser,
	getUserByMail,
	isEmailAvailable,
	deleteAccount
}
