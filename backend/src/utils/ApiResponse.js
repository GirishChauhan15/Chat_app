// Centralized and Structured Response Handling
export default class ApiResponse{
    constructor(statusCode=200, data={}, message='Success.') {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}