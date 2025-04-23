import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    secureUrl : {
        type: String,
        required: true
    },
    publicImageId : {
        type: String,
        required: true
    }
},{timestamps:true})

export const Picture = mongoose.model('Picture', imageSchema)

