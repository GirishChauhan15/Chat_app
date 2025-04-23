import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const userSchema = new mongoose.Schema({
    fullName : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    refreshTokens : {
        type: String,
    },
    profilePicture : {
        type: String,
        default: ""
    },
    publicImageId : {
        type: String,
        default: ""
    }
},{timestamps:true})

// Pagination setup
userSchema.plugin(mongooseAggregatePaginate)

// Auto encrypt password on save
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// Generates Refresh token (JWT)
userSchema.methods.generateRefToken = async function () {
    return await jwt.sign({userId : this._id}, process.env.REF_TOKEN_SECRET , {expiresIn: process.env.REF_TOKEN_EXPIRY})
}

// Generates Access token (JWT)
userSchema.methods.generateAccToken = async function () {
    return await jwt.sign({userId : this._id}, process.env.ACC_TOKEN_SECRET , {expiresIn: process.env.ACC_TOKEN_EXPIRY})
}

// Compare user's password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema)