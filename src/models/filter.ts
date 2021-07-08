import mongoose, { Schema } from "mongoose"

const filterSchema = new mongoose.Schema({
	applicant: {
		type: Schema.Types.ObjectId,
		ref: "Applicant",
		required: true,
		unique: true
	},
	priceRange: {
		currency: {
			type: String,
			required: true
		},
		minPrice: Number,
		maxPrice: Number,
	},
	ageRange: {
		minAge: {
			type: Number,
			min: 0,
			max: 120
		},
		maxAge: {
			type: Number,
			min: 0,
			max: 120
		}
	},
	location: {
		country: {
			type: String,
			required: true
		},
		city: String,
		zipCode: String,
		address: String,
		distance: Number
	},
	roomMatesNumber: {
		type: Number,
		min: 0,
		max: 20
	},
	furnished: Boolean,
	minYearConstructed: Date
})

export interface IFilter {
	applicant: string
	priceRange?: {
		currency: string
		minPrice?: number
		maxPrice?: number
	}
	ageRange?: {
		minAge?: number
		maxAge?: number
	}
	location?: {
		country: string
		city?: string
		zipCode?: string
		address?: string
		distance?: number
	}
	roomMatesNumber?: number
	furnished?: boolean
	minYearConstructed?: Date
}

export interface FilterDoc extends IFilter, mongoose.Document {
	id: number
	_doc: any
}

interface FilterModelInterface extends mongoose.Model<FilterDoc> {
	build(attr: IFilter): any
}

filterSchema.statics.build = (attr: IFilter) => {
	return new Filter(attr)
}

const Filter = mongoose.model<FilterDoc, FilterModelInterface>("Filter", filterSchema)

export { Filter }