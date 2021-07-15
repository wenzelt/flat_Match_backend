import { HousingOffer } from "../models/housingOffer"
import { User } from "../models/user"

const createOffer = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0)
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	// Get flatmates User._id from the Db, to store in housingOffer
	const flatmates = await User.find({ email: req.body.flatmates }).exec()
	const flatmatesIds = flatmates.map((flatmate: any) => flatmate._doc._id)
	req.body.flatmates = flatmatesIds
	// handle the request
	try {
		// create movie in database
		const housingOffer = await HousingOffer.create(req.body)

		// return created movie
		return res.status(201).json(housingOffer)
	} catch (err) {
		return res.status(500).json({
			error: "Internal server error",
			message: err.message,
		})
	}
}

const getOffer = async (req: any, res: any) => {
	try {
		// get movie with id from database
		const housingOffer = await HousingOffer.findById(req.params.id).exec()

		// if no movie with id is found, return 404
		if (!housingOffer)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})

		// return gotten movie
		return res.status(200).json(housingOffer)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const getOffers = async (req: any, res: any) => {
	try {
		// get offers of user._id from database
		const housingOffers = await HousingOffer.find({ tenant: req.query.id }).exec()

		// if no offers with user._id found, return 404
		if (!housingOffers)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})

		// return gotten movie
		return res.status(200).json(housingOffers)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}


const updateOffer = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0) {
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	}

	// handle the request
	try {
		// find and update movie with id
		const housingOffer = await HousingOffer.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		).exec()

		// return updated movie
		return res.status(200).json(housingOffer)
	} catch (err) {
		return res.status(500).json({
			error: "Internal server error",
			message: err.message,
		})
	}
}

const removeOffer = async (req: any, res: any) => {
	try {
		// find and remove movie
		await HousingOffer.findByIdAndRemove(req.params.id).exec()

		// return message that movie was deleted
		return res
			.status(200)
			.json({ message: `Housingoffer with id:${req.params.id} was deleted` })
	} catch (err) {
		return res.status(500).json({
			error: "Internal server error",
			message: err.message,
		})
	}
}

export { createOffer, getOffer, getOffers, updateOffer, removeOffer }
