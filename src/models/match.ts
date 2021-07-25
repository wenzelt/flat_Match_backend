import mongoose, { Schema } from "mongoose"

const matchSchema = new mongoose.Schema({
	tenant: {
		type: Schema.Types.ObjectId,
		ref: "Tenant",
		required: true,
	},
	applicant: {
		type: Schema.Types.ObjectId,
		ref: "Applicant",
		required: true,
	},
	offer: {
		type: Schema.Types.ObjectId,
		ref: "HousingOffer",
		required: true,
	}
})

export interface IMatch {
	applicant: string
	tenant: string
	offer: string
}

export interface MatchDoc extends IMatch, mongoose.Document {
	id: number
	_doc: any
}

interface MatchModelInterface extends mongoose.Model<MatchDoc> {
	build(attr: IMatch): any
}

matchSchema.statics.build = (attr: IMatch) => {
	return new Match(attr)
}

const Match = mongoose.model<MatchDoc, MatchModelInterface>("Match", matchSchema)

export { Match }