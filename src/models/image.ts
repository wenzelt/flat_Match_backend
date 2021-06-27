import { Schema } from "mongoose"
import * as mongoose from "mongoose"

const imageSchema = new mongoose.Schema({
	name: String,
	desc: String,
	user: Schema.Types.ObjectId,
	img:
	{
		data: Buffer,
		contentType: String
	}
})

const Image = mongoose.model("Image", imageSchema)
export { Image }
