import { Match } from "../models/match"


const getMatchOfApplicant = async (req: any, res: any) => {
	try {
		const filter = { applicant: req.userId }
		const matchOfUser = await Match.find(filter)

		return res.status(200).json(matchOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const getMatchOfTenant = async (req: any, res: any) => {
	try {
		const filter = { tenant: req.userId }
		const matchOfUser = await Match.find(filter)

		return res.status(200).json(matchOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

const createMatch = async (req: any, res: any) => {
	// check if the body of the request contains all necessary properties
	if (Object.keys(req.body).length === 0) {
		return res.status(400).json({
			error: "Bad Request",
			message: "The request body is empty",
		})
	}

	try {
		// Save the new Match
		const newMatch = new Match({
			tenant: req.body.tenant,
			applicant: req.body.applicant,
			offer: req.body.offer
		})

		const matchOfUser = await Match.create(newMatch)

		return res.status(200).json(matchOfUser)
	} catch (err) {
		return res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		})
	}
}

export { getMatchOfTenant, getMatchOfApplicant, createMatch }