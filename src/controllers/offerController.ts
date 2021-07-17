import {HousingOffer} from "../models/housingOffer"
import {User} from "../models/user"
import {Filter, FilterDoc} from "../models/filter"


function jsonFilterToMongoFilter(jsonFilter: FilterDoc) {
	const filteredJson = jsonFilter.toJSON()
	return {
		__name__: "JsonFilter",
		"price.amount": { $gt: filteredJson.priceRange.minPrice, $lt: filteredJson.priceRange.minPrice },
		"price.currency": "EUR",
		"ageRange.maxAge": { $lt: filteredJson.ageRange.maxAge },
		"ageRange.minAge": { $gt: filteredJson.ageRange.minAge },
		"$expr": {
			$and: [
				{ "$gt": [{ "$strLenCP": "flatmates" }, filteredJson.roomMatesNumber.minNumber] },
				{ "$lt": [{ "$strLenCP": "flatmates" }, filteredJson.roomMatesNumber.maxNumber] }]
		}
	}
}

const getFilteredOffer = async (req: any, res: any) => {
	try {
		const filter = { applicant: req.userId }
		const filterOfUser = await Filter.findOne(filter)
		if (!filterOfUser)
			return res.status(404).json({
				error: "Not Found",
				message: `No Filter set for this user, please set one to narrow down the offerings.`,
			})

		const mongoFilterFromJSON = jsonFilterToMongoFilter(filterOfUser)
		const housingOffersAfterFilter = await HousingOffer.find(mongoFilterFromJSON)
		// if no offer with id is found, return 404
		if (!housingOffersAfterFilter)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})

		// return gotten offerings
		return res.status(200).json(housingOffersAfterFilter)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}


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

export { createOffer, getOffer, getOffers, updateOffer, removeOffer, getFilteredOffer }
