import { Request as eRequest } from "express"
import { GridFsStorage } from "multer-gridfs-storage"
import mongoose from "mongoose"
import multer from "multer"
import { getFileByName, multerUploadPromise } from "../shared/gridFSHelperFuctions"
import { dbUrl } from "../server"
import { Logger } from "tslog"

const log = new Logger({ name: "Profile Controller" })

const getProfilePictureMetaDataOfUser = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'profilePictures'
		})
		const files = await gfs.find({ filename: { $regex: req.userId + '.*' } }).toArray()
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

const getProfilePicture = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'profilePictures'
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

const deleteProfilePicture = async (req: any, res: any) => {
	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'profilePictures'
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

const uploadProfilePicture = async (req: any, res: any) => {
	try {
		await handleFile(req, req.userId)
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

const handleFile = async (request: eRequest, userId: string): Promise<any> => {
	const storage = new GridFsStorage({
		url: dbUrl,
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		},
		file: (fileToUpload: any) => {
			return {
				filename: userId + '_' + Date.now(),
				bucketName: 'profilePictures',
			}
		}
	})
	// limit the upload to 1 file attached in multiline form of max 30MB
	const upload = multer({ fileFilter: imageFilter, storage, limits: { fileSize: 30 * 1024 * 1024, files: 1 } })

	const multerSingle = upload.single("image")
	return multerUploadPromise(multerSingle, request)
}

export {
	uploadProfilePicture,
	getProfilePicture,
	getProfilePictureMetaDataOfUser,
	deleteProfilePicture
}
