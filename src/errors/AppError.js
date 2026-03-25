// Custom operational errors so that we can intentionally show this to client
class AppError extends Error{
    constructor(message, statusCode = 400){
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = true
    }
}

module.exports = {AppError}

