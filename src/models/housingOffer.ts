import mongoose, { Schema } from "mongoose"

const housingOfferSchema = new mongoose.Schema({
	tenants: [{
		type: Schema.Types.ObjectId,
		ref: "Tenant",
		required: true,
		unique: true
	}],
	price: {
		currency: {
			type: String,
			required: true
		},
		amount: Number,
	},
	images: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: "Image",
			required: true
		}],
		required: true,
		validate: [arrayLimit, 'No more than 20 images are allowed']
	},
	location: {
		country: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		zipCode: {
			type: String,
			required: true
		},
		address: {
			type: String,
			required: true
		}
	},
	description: {
		type: String,
		requried: true
	},
	roomSize: {
		type: Number,
		required: true
	},
	yearConstructed: {
		type: Number,
		required: false
	},
	title: {
		type: String,
		requried: true
	},
	ageRange: {
		minAge: {
			type: Number,
			min: 0,
			max: 120,
			required: true
		},
		maxAge: {
			type: Number,
			min: 0,
			max: 120,
			required: true
		}
	},
	moveInDate: {
		type: Date,
		required: true
	},
	furnished: {
		type: Boolean,
		required: true
	},
	numberOfRooms: {
		type: Number,
		requried: true
	},
	values: [{
		type: String,
		required: true
	}],

})

// Limit number of pictures to 20
function arrayLimit(val: any) {
	return val.length <= 20
}


export interface IHousingOffer {
	tenants: string
	price: {
		currency: string
		amount: number
	}
	images: [string]
	location: {
		country: string
		city: string
		zipCode: string
		address?: string
	}
	description: string
	roomSize: number
	yearConstructed?: number
	title: string
	ageRange?: {
		minAge?: number
		maxAge?: number
	}
	moveInDate: Date
	furnished: boolean
	numberOfRooms?: number
	values: [string]
}

export interface HousingOfferDoc extends IHousingOffer, mongoose.Document {
	id: number
	_doc: any
}

interface HousingOfferModelInterface extends mongoose.Model<HousingOfferDoc> {
	build(attr: IHousingOffer): any
}

housingOfferSchema.statics.build = (attr: IHousingOffer) => {
	return new HousingOffer(attr)
}

const HousingOffer = mongoose.model<HousingOfferDoc, HousingOfferModelInterface>("HousingOffer", housingOfferSchema)

export { HousingOffer }
