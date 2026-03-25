const pool = require("../config/db");
const { evaluateCalculation } = require("../services/calculationService");
const { parseCalculationId } = require("../utils/parseCalculationId")

exports.evaluate = async (req, res) => {
    console.log(req.params.calculationId);
    const calculationId = parseCalculationId(req.params.calculationId);
    console.log(calculationId)
    const result = await evaluateCalculation(pool, calculationId);
    return res.status(200).json({
        success: true,
        result
    })
}