import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Validate user
const auth = asyncHandler(async (req, res, next) => {
    try {
        // Access token from headers
        const isTokenValid = req.headers.authorization
        if(!isTokenValid?.includes('Bearer')) {
            return res.status(400).json(new ApiError(400, "Invalid token"))
        }
        const token = isTokenValid?.split(' ')[1]

        const decoded = jwt.verify(token, process.env.ACC_TOKEN_SECRET)

        if(!decoded) return res.status(401).json(new ApiError(401, "Token is expired or used!"))
        
        const user = await User.findById(decoded?.userId).select('-password -refreshTokens -publicImageId').lean().exec()

        if(!user) return res.status(401).json(new ApiError(401, "unauthorized access."))

        // Valid user info is set to request
        req.user = user
        next()

    } catch (error) {
        return res.status(401).json(new ApiError(401, "unauthorized access."))
    }
})

export default auth