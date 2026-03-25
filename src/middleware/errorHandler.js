const { AppError } = require("../errors/AppError");


const errorHandler = (err, req, res, next) => {

    if(res.headersSent){
        next(err);
        return
    }

    const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;

    const message = statusCode === 500 && !(err instanceof AppError) ? 'Internal Server Error' : err.message || 'Internal Server Error';

    if(statusCode > 500){
        console.log(`Error: ${err}`);
    }

    res.status(statusCode).json({
        success: false,
        error: message
    })
}


module.exports = {errorHandler}