import mongoose from "mongoose"
import { Request as eRequest } from "express"
import { Logger } from "tslog"

const log = new Logger({ name: "GrifFS File Extraction" })

export async function getFileByName(gfs: any, filename: string) {
	let result: EncodedFile
	const files = await gfs.find({ filename }).toArray()
	if (files.length > 0) {
		const bufs = []
		const readStream = gfs.openDownloadStream(files[0]._id)

		await new Promise((resolve: any) => {
			readStream.on('data', (chunk) => {
				bufs.push(chunk)
			})

			readStream.on('error', (error: any) => {
				log.error(error)
				result = {
					success: false
				}
				resolve()
			})

			readStream.on('end', () => {
				const base64 = Buffer.concat(bufs).toString('base64')

				// const data = 'data:' + files[0].contentType + ';base64,' + base64

				result = {
					success: true,
					file: base64,
					mime: files[0].contentType
				}
				resolve()
			})
		})
	} else {
		log.info("File not found")
		result = {
			success: false
		}
	}
	return result
}

export async function getFileById(gfs: any, id: string) {
	if (id === undefined || id === null || id === "") {
		return {
			success: false
		}
	}
	let result: EncodedFile
	const files = await gfs.find(mongoose.Types.ObjectId(id)).toArray()
	if (files.length > 0) {
		const bufs = []
		const readStream = gfs.openDownloadStream(files[0]._id)

		await new Promise((resolve: any) => {
			readStream.on('data', (chunk) => {
				bufs.push(chunk)
			})

			readStream.on('error', (error: any) => {
				log.error(error)
				result = {
					success: false
				}
				resolve()
			})

			readStream.on('end', () => {
				const base64 = Buffer.concat(bufs).toString('base64')

				// const data = 'data:' + files[0].contentType + ';base64,' + base64

				result = {
					success: true,
					file: base64,
					mime: files[0].contentType
				}
				resolve()
			})
		})
	} else {
		log.info("File not found")
		result = {
			success: false
		}
	}
	return result
}

export function multerUploadPromise(uploadCallback, request: eRequest): Promise<any> {
	return new Promise((resolve: any, reject: any) => {
		uploadCallback(request, undefined, async (error: any) => {
			if (error) {
				log.error(`Multer error: ${error}`)
				reject(error)
			}

			// here the request contains the file inside request.file
			if (request.file !== undefined) {
				const object = {
					"Filename": request.file.filename,
					"Mime": request.file.mimetype,
					"Size": request.file.size,
					"Original name": request.file.originalname
				}
				log.debug(`Multer file: ${JSON.stringify(object)}`)
				resolve()
			}
			if (request.files !== undefined) {
				resolve()
			}
			reject(Error("Should not have reached this state!"))
		})
	})
}

export interface EncodedFile {
	success: boolean
	file?: string
	mime?: string
}