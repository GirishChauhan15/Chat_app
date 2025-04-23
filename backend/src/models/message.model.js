import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const messageSchema = new mongoose.Schema({
    senderId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
    },
    receiverId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message : {
        type: String,
    },
    image : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Picture"
    }
},{timestamps:true})

// Pagination setup
messageSchema.plugin(mongooseAggregatePaginate)

export const Message = mongoose.model('Message', messageSchema)