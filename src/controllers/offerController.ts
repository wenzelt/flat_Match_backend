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


function jsonFilterToMongoFilter(filterOfUser: any) {
	const JSONfilter = filterOfUser.toJSON()
	const filterString = JSON.stringify(JSONfilter)

	const query: any = {}

	// filter User Side
	if (filterString.includes("priceRange")) {
		query["price.amount"] = { $gte: JSONfilter.priceRange.minPrice, $lt: JSONfilter.priceRange.maxPrice }
	}
	if (filterString.includes("ageRange")) {
		query["ageRange.maxAge"] = { $lte: JSONfilter.ageRange.maxAge }
	}
	if (filterString.includes("ageRange")) {
		query["ageRange.minAge"] = { $gte: JSONfilter.ageRange.minAge }
	}
	if (filterString.includes("roomMatesNumber")) {
		query.$expr = {
			$and: [
				{ "$gte": [{ "$strLenCP": "flatmates" }, JSONfilter.roomMatesNumber.minNumber] },
				{ "$lte": [{ "$strLenCP": "flatmates" }, JSONfilter.roomMatesNumber.maxNumber] }]
		}
	}
	if (filterString.includes("furnished")) {
		query.furnished = JSONfilter.furnished
	}
	if (filterString.includes("minYearConstructed")) {
		query.yearConstructed = { $gt: new Date(JSONfilter.minYearConstructed.getFullYear()) }
	}
	return query
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
		const housingOffers = await HousingOffer.find({ tenant: req.params.userId }).exec()

		// if no offers with user._id found, return 404
		if (!housingOffers)
			return res.status(404).json({
				error: "Not Found",
				message: `Housing Offer not found`,
			})

		// return gotten offer
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
