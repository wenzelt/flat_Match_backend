import { Filter } from "../models/filter"


const getFilter = async (req: any, res: any) => {
	try {
		const filter = { applicant: req.userId }
		const filterOfUser = await Filter.findOne(filter)

		if (filterOfUser === null || filterOfUser === undefined)
			return res.status(404).json({
				error: "Not Found",
				message: `No filter was found for this user`,
			})

		return res.status(200).json(filterOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const createFilter = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0) {
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	}

	try {
		// Save the new Filter
		const newFilter = new Filter({
			...req.body,
			applicant: req.userId
		})

		const filterOfUser = await Filter.create(newFilter)

		return res.status(200).json(filterOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const updateFilter = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0) {
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	}

	// update the existing filter
	try {
		const filter = { applicant: req.userId }
		const update = {
			...req.body,
			applicant: req.userId
		}

		const filterOfUser = await Filter.findOneAndUpdate(filter, update, {
			new: true,
			runValidators: true,
		})

		return res.status(200).json(filterOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

export { getFilter, createFilter, updateFilter }