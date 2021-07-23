import { Request as eRequest } from "express"
import { GridFsStorage } from "multer-gridfs-storage"
import mongoose from "mongoose"
import multer from "multer"
import { getFileByName, multerUploadPromise } from "../shared/gridFSHelperFuctions"
import { dbUrl } from "../server"
import { Logger } from "tslog"
import { HousingOffer } from "../models/housingOffer"
import { User } from "../models/user"
import { Filter, FilterDoc } from "../models/filter"
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

function toRadians(Value) {
	return Value * Math.PI / 180
}

function calcDistance(geoData) {
	const R = 6371 // km
	const deltaLatitude = toRadians(geoData.lat2 - geoData.lat1)
	const deltaLongitude = toRadians(geoData.long2 - geoData.long1)
	const lat1 = toRadians(geoData.lat1)
	const lat2 = toRadians(geoData.lat2)

	const a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
		Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2) * Math.cos(lat1) * Math.cos(lat2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

function appendDistance(filterGeo: any, offerGeo: any) {
	const returnArray: any = []
	let distanceResult: number = 10
	for (const offer of offerGeo) {
		distanceResult = calcDistance({
			"lat1": offer.location.latitude,
			"lat2": filterGeo.lat,
			"long1": offer.location.longitude,
			"long2": filterGeo.long
		})
		offer.distanceToFilterLocation = distanceResult
		returnArray.push(offer)
	}
	return returnArray
}


function filterDistance(offers: any, maxDistance: number) {
	const returnArray: any = []
	for (const offer of offers) {
		if (offer.distanceToFilterLocation < maxDistance) {
			returnArray.push(offer)
		}
	}
	return returnArray
}

function jsonFilterToMongoFilter(filterOfUser: FilterDoc) {
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

async function getFilterGeo(filter) {
	try {
		const queryFilter = `${filter.location.country},${filter.location.city},${filter.location.address}`.toString()
		const url = `http://api.positionstack.com/v1/forward`
		const response = await axios({
			method: 'get',
			url,
			headers: { 'Content-Type': 'application/json;charset=UTF-8' },
			params: { access_key: "f5d1f0164715adf90867d700bc6c8555", query: queryFilter, limit: 10 }
		})
		return { "lat": response.data.data[0].latitude, "long": response.data.data[0].longitude }
	} catch (error) {
		return error
	}
}

async function getOfferGeo(housingOffersAfterFilter: any) {
	const returnArray = []
	for (const offer of housingOffersAfterFilter) {
		try {
			const queryFilter = `Germany,${offer.location.city},${offer.location.address}`
			const url = `http://api.positionstack.com/v1/forward`
			const response = await axios({
				method: 'get',
				url,
				headers: { 'Content-Type': 'application/json;charset=UTF-8' },
				params: { access_key: "f5d1f0164715adf90867d700bc6c8555", query: queryFilter, limit: 10 }
			})
			if (response.status === 200 && response.data.data.length !== 0) {
				offer.location.latitude = response.data.data[0].latitude
				offer.location.longitude = response.data.data[0].longitude
				returnArray.push(offer)
			}
		} catch (error) {
			return error
		}
	}
	return returnArray
}

function calculateAge(birthday) { // birthday is a date
	const ageDifMs = Date.now() - birthday.getTime()
	const ageDate = new Date(ageDifMs) // miliseconds from epoch
	return Math.abs(ageDate.getUTCFullYear() - 1970)
}


function filterUserAge(housingOffersAfterFilter, userAge: number) {
	const returnArray = []
	for (const offer of housingOffersAfterFilter) {
		if (userAge <= offer.ageRange.maxAge && userAge > offer.ageRange.minAge) {
			returnArray.push(offer)
		}
	}
	housingOffersAfterFilter = returnArray
	return housingOffersAfterFilter
}

const getFilteredOffer = async (req: any, res: any) => {
	try {
		const filter = { applicant: req.userId }
		const user = await User.findById(req.userId).lean()
		// @ts-ignore
		const userAge = calculateAge(user.date_of_birth)
		const filterOfUser = await Filter.findOne(filter)
		if (!filterOfUser)
			return res.status(404).json({
				error: "Not Found",
				message: `No Filter set for this user, please set one to narrow down the offerings.`,
			})
		const originalFilter = filterOfUser.toJSON()

		const mongoFilterFromJSON = jsonFilterToMongoFilter(filterOfUser)
		let housingOffersAfterFilter = await HousingOffer.find(mongoFilterFromJSON).lean().limit(40)
		// if no offer with id is found, return 404
		if (!housingOffersAfterFilter)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})
		housingOffersAfterFilter = filterAmountOfFlatmates(housingOffersAfterFilter, originalFilter)

		if (userAge) {
			housingOffersAfterFilter = filterUserAge(housingOffersAfterFilter, userAge)
		}
		// if filter has location do this
		if (originalFilter.hasOwnProperty("location")) {
			if (originalFilter.location.hasOwnProperty("distance")) {
				const filterGEO = await getFilterGeo(originalFilter)
				const offersWithGeoAppended = await getOfferGeo(housingOffersAfterFilter)
				housingOffersAfterFilter = filterDistance(filterGEO, offersWithGeoAppended, filterOfUser.toJSON().location.distance)
			}
		}


		// return gotten offerings
		return res.status(200).json(housingOffersAfterFilter)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}


const log = new Logger({ name: "Offer Controller" })

const createOffer = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0)
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	// Get flatmates User._id from the Db, to store in housingOffer
	const flatmates = await User.find({ email: req.body.flatmates }).exec()
    req.body.flatmates = flatmates.map((flatmate: any) => flatmate._doc._id)
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

const getOfferPicturesMetaData = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'offerPictures'
		})
		const files = await gfs.find({ filename: { $regex: req.params.id + '.*' } }).toArray()
		return res.status(200).json(files.map(file => ({
			_id: file._id,
			fileName: file.filename,
			uploadDate: file.uploadDate
		})))
	} catch (error) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: error.message,
		})
	}
}

const getOfferPicture = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'offerPictures'
		})
		const file = await getFileByName(gfs, req.params.fileName)
		return res.status(200).json(file)
	} catch (error) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: error.message,
		})
	}
}

const deleteOfferPicture = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'offerPictures'
		})
		const file = await gfs.find({ filename: req.params.fileName }).toArray()
		if (file.length > 0) {
			await gfs.delete(file[0]._id)
		}
		return res.status(200).json(true)
	} catch (error) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: error.message,
		})
	}
}

const uploadOfferPicture = async (req: any, res: any) => {
	try {
		await handleFile(req, req.params.id)
	} catch (error: any) {
		log.error(error)
		return res.status(500).json({
			error: "Internal Server Error",
			message: error.message,
		})
	}
	return res.status(200).json(true)
}

const imageFilter = (req: any, file: any, cb: any) => {
	if (!file.originalname.match(/\.(JPG|jpg|jpeg|png)$/)) {
		return cb(new Error('Only image files are allowed!'), false)
	}
	cb(null, true)
}

const handleFile = async (request: eRequest, offerId: string): Promise<any> => {
	const storage = new GridFsStorage({
		url: dbUrl,
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		},
		file: (fileToUpload: any) => {
			return {
				filename: offerId + '_' + Date.now(),
				bucketName: 'offerPictures',
			}
		}
	})
	// limit the upload to 1 file attached in multiline form of max 30MB
	const upload = multer({ fileFilter: imageFilter, storage, limits: { fileSize: 30 * 1024 * 1024, files: 1 } })

	const multerSingle = upload.single("image")
	return multerUploadPromise(multerSingle, request)
}

export {
	createOffer,
	getOffer,
	getOffers,
	updateOffer,
	removeOffer,
	getFilteredOffer,
	// offer pictures
	getOfferPicturesMetaData,
	getOfferPicture,
	uploadOfferPicture,
	deleteOfferPicture
}
