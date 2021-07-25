import { Schema } from "mongoose"
import * as mongoose from "mongoose"
import { User, userType } from "./user"

const applicantSchema = new mongoose.Schema({
	smoker: {
		type: Boolean,
		required: true,
	},
	declined_offers: [{
		type: Schema.Types.ObjectId,
		ref: "HousingOffer",
		required: true,
	}],
	accepted_offers: [{
		type: Schema.Types.ObjectId,
		ref: "HousingOffer",
		required: true,
	}],
}, userType)

export interface IApplicant {
	email: string
	password: any
	first_name: string
	last_name: string
	gender: string
	bio?: string
	date_of_birth: Date
	occupation?: string
	place_of_residency?: {
		country?: string
		city?: string
		zipCode?: string
		address?: string
	}
	interests: [string]
	smoker: boolean
	declined_offers: [Schema.Types.ObjectId]
	accepted_offers: [Schema.Types.ObjectId]
	userType: string
}

export interface ApplicantDoc extends IApplicant, mongoose.Document {
	id: number
	_doc: any
}

interface ApplicantModelInterface extends mongoose.Model<ApplicantDoc> {
	build(attr: IApplicant): any
}


applicantSchema.statics.build = (attr: IApplicant) => {
	return new Applicant(attr)
}

const Applicant = User.discriminator<ApplicantDoc, ApplicantModelInterface>("Applicant", applicantSchema)
export { Applicant }
