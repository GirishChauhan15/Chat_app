import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler((_,res)=>{
    res.status(200).json(new ApiResponse(200,{},"Working...."))
})

export {healthCheck}