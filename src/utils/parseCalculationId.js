const { AppError } = require("../errors/AppError")


const parseCalculationId = (raw) => {
    if(raw === undefined || raw === null || String(raw).trim() === ''){
        throw new AppError('Calculation ID isrequired', 400)
    }

    const n = Number.parseInt(String(raw), 10);
    if(!Number.isInteger(n) || n < 1){
        throw new AppError('Calculation ID must be a positive int', 400);
    }

    return n;
}

module.exports = {parseCalculationId}