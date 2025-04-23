// Centralized and Structured Error Handling
export default class ApiError{
    constructor(statusCode=500, message='Something went wrong!') {
        this.statusCode = statusCode
        this.message = message
        this.success = false
    }
}