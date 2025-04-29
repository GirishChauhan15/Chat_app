import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler((_,res)=>{
    try {
        res.status(200).json(new ApiResponse(200,{},"Working...."))
    } catch (error) {
        res.status(500).json(new ApiError(500,"Not Working...."))
    }
})

export {healthCheck}