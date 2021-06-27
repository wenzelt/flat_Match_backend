// @ts-ignore
import jwt = require("jsonwebtoken")
import User = require("../models/user")
import Applicant = require("../models/applicant")
import Tennant = require("../models/tennant")

const JWT_SECRET = process.env.JWT_SECRET

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

export { checkAuthentication }

