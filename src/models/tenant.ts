import { Schema } from "mongoose"
import * as mongoose from "mongoose"
import { User, userType } from "./user"

const tenantSchema: Schema = new mongoose.Schema({
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

export interface ITenant {
	email: string
	password: any
	first_name: string
	last_name: string
	gender: string
	image: [Schema.Types.ObjectId]
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
	declined_applicants: [Schema.Types.ObjectId]
	accepted_applicants: [Schema.Types.ObjectId]
	userType: string
}

export interface TenantDoc extends ITenant, mongoose.Document {
	id: number
	_doc: any
}

interface TenantModelInterface extends mongoose.Model<TenantDoc> {
	build(attr: ITenant): any
}


tenantSchema.statics.build = (attr: ITenant) => {
	return new Tenant(attr)
}

const Tenant = User.discriminator<TenantDoc, TenantModelInterface>("Tenant", tenantSchema)
export { Tenant }
