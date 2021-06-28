import { Schema } from "mongoose"
import * as mongoose from "mongoose"
import { User, userType } from "./user"

const tennantSchema: Schema = new mongoose.Schema({
	declined_applicants: [{
		type: Schema.Types.ObjectId,
		ref: "Applicant",
		required: true,
	}],
	accepted_applicants: [{
		type: Schema.Types.ObjectId,
		ref: "Applicant",
		required: true,
	}],
}, userType)

export interface ITennant {
	email: string
	password: any
	first_name: string
	last_name: string
	gender: string
	image: [Schema.Types.ObjectId]
	bio: string
	date_of_birth: Date
	occupation: string
	place_of_residency: {
		country: string
		city: string
		zipCode: string
		address: string
	}
	interests: [string]
	declined_applicants: [Schema.Types.ObjectId]
	accepted_applicants: [Schema.Types.ObjectId]
	userType: string
}

export interface TennantDoc extends ITennant, mongoose.Document {
	id: number
	_doc: any
}

interface TennantModelInterface extends mongoose.Model<TennantDoc> {
	build(attr: ITennant): any
}


tennantSchema.statics.build = (attr: ITennant) => {
	return new Tennant(attr)
}

const Tennant = User.discriminator<TennantDoc, TennantModelInterface>("Tennant", tennantSchema)
export { Tennant }
