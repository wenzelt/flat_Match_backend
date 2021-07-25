// @ts-ignore
import jwt = require("jsonwebtoken")
import { User } from "../models/user"

const checkAuthentication = (req: any, res: any, next: any) => {
	// check header or url parameters or post parameters for token
	let token = ""
	if (req.headers.authorization) {
		token = req.headers.authorization.split(" ")[2]  // Changed from 1 to 2 because of Postman
	}

	if (!token)
		return res.status(401).send({
			error: "Unauthorized",
			message: "No token provided in the request",
		})

	// remove quotation of json variable
	token = token.replace(/["]+/g, '')

	// verifies secret and checks exp
	jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
		if (err)
			return res.status(401).send({
				error: "Unauthorized",
				message: "Failed to authenticate token.",
			})

		// if everything is good, save to request for use in other routes
		req.userId = decoded._id
		next()
	})
}

const checkIsTenant = async (req: any, res: any, next: any) => {
	// checkAuthentication must be executed before this method
	// if not req.userId is not defined
	try {
		const user: any = await User.findById(req.userId)
		if (user.userType === "Tenant") {
			// if the user is an Tenant continue with the execution
			next()
		} else {
			// if the user is no tenant return that the user has not the rights for this action
			return res.status(403).send({
				error: "Forbidden",
				message: "You do not have the rights for this action.",
			})
		}
	} catch (error) {
		return res.status(403).send({
			error: "Forbidden",
			message: "You do not have the rights for this action.",
		})
	}
}

const checkIsApplicant = async (req: any, res: any, next: any) => {
	// checkAuthentication must be executed before this method
	// if not req.userId is not defined
	try {
		const user: any = await User.findById(req.userId)
		if (user.userType === "Applicant") {
			// if the user is an applicant continue with the execution
			next()
		} else {
			// if the user is no applicant return that the user has not the rights for this action
			return res.status(403).send({
				error: "Forbidden",
				message: "You do not have the rights for this action.",
			})
		}
	} catch (error) {
		return res.status(403).send({
			error: "Forbidden",
			message: "You do not have the rights for this action.",
		})
	}
}


export { checkAuthentication, checkIsTenant, checkIsApplicant }

