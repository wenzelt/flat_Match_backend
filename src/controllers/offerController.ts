import { HousingOffer } from "../models/housingOffer"
import { User } from "../models/user"
import { Filter } from "../models/filter"
import axios from "axios"


function filterAmountOfFlatmates(offers: any, filter: any) {
	const returnArray: any[] = []
	if (filter.hasOwnProperty("roomMatesNumber")) {
		for (const i of offers) {
			const numberFlatMates = i.flatmates.length
			if (numberFlatMates >= filter.roomMatesNumber.minNumber && numberFlatMates <= filter.roomMatesNumber.maxNumber) {
				returnArray.push(i)
			}
		}
	} else {
		return offers
	}
	return returnArray

}
//
// function calcDistance() {
//
// }

// function filterDistance(filterGeo: any, offerGeo: any, maxDistance: any) {
//     const returnArray: any = []
//     let distanceResult : number = 10
//     for (const offer of offerGeo) {
//         calcDistance({"lat1": offer.location.latitude, "lat2" : filterGeo.lat, "long1":offer.location.longitude, "long2": filterGeo.long})
//         if (distanceResult < maxDistance) {
//             returnArray.push(offer)
//         }
//
//     }
//     return returnArray
// }

function jsonFilterToMongoFilter(filterOfUser: any) {
	const JSONfilter = filterOfUser.toJSON()
	const filterString = JSON.stringify(JSONfilter)

	const mongoQuery: any = {}

	// filter User Side
	if (filterString.includes("priceRange")) {
		mongoQuery["price.amount"] = { $gte: JSONfilter.priceRange.minPrice, $lt: JSONfilter.priceRange.maxPrice }
	}
	if (filterString.includes("ageRange")) {
		mongoQuery["ageRange.maxAge"] = { $lte: JSONfilter.ageRange.maxAge }
	}
	if (filterString.includes("ageRange")) {
		mongoQuery["ageRange.minAge"] = { $gte: JSONfilter.ageRange.minAge }
	}
	if (filterString.includes("furnished")) {
		mongoQuery.furnished = JSONfilter.furnished
	}
	if (filterString.includes("minYearConstructed")) {
		mongoQuery.yearConstructed = { $gt: new Date(JSONfilter.minYearConstructed).toISOString() }
	}

	return mongoQuery
}

async function getFilterGeo(filter: any) {
	// filter.location = {}
	// filter.location.country = "Munich"
	// filter.location.city = "Munich"
	// filter.location.address = "Situlistr 67"
	try {
		const queryFilter = `${filter.location.country},${filter.location.city},${filter.location.address}`
		const response = await axios.get(`http://api.positionstack.com/v1/forward?access_key=f5d1f0164715adf90867d700bc6c8555&query=${queryFilter}&limit=10`)
		return { "lat": response.data.data[0].latitude, "long": response.data.data[0].longitude }
	} catch (error) {
		// console.error(error);
		return error
	}
}

async function getOfferGeo(housingOffersAfterFilter: any) {
	const returnArray = []
	for (const offer of housingOffersAfterFilter) {
		try {
			offer.location = {}
			offer.location.country = "Munich"
			offer.location.city = "Munich"
			offer.location.address = "Situlistr 67"
			const queryFilter = `${offer.location.country},${offer.location.city},${offer.location.address}`
			const response = await axios.get(`http://api.positionstack.com/v1/forward?access_key=f5d1f0164715adf90867d700bc6c8555&query=${queryFilter}&limit=10`)
			offer.location.latitude = response.data.data[0].latitude
			offer.location.longitude = response.data.data[0].longitude
			returnArray.push(offer)
		} catch (error) {
			return error
		}
	}
	return returnArray
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
		let housingOffersAfterFilter = await HousingOffer.find(mongoFilterFromJSON).lean()
		// if no offer with id is found, return 404
		if (!housingOffersAfterFilter)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})
		housingOffersAfterFilter = filterAmountOfFlatmates(housingOffersAfterFilter, filterOfUser.toJSON())

		// if filter has location do this
		if (filterOfUser.toJSON().hasOwnProperty("location")) {
			const originalFilter = filterOfUser.toJSON()
			const queryFilter = originalFilter.location.country + "," + originalFilter.location.city + "," + originalFilter.location.address
			const filterGEO = await getFilterGeo(originalFilter)
			const offersWithGeoAppended = await getOfferGeo(housingOffersAfterFilter)
			// housingOffersAfterFilter = filterDistance(filterGEO, offersWithGeoAppended, filterOfUser.toJSON().location.distance)
		}
		// housingOffersAfterFilter = filterDistance(housingOffersAfterFilter, mongoFilterFromJSON)
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
