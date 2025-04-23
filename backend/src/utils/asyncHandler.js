// Higher order function
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        try {
            requestHandler(req,res,next)
        } catch (error) {
            next(error)
        }
    }
}

export default asyncHandler