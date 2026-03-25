const pool = require("../config/db");
const { evaluateCalculation, recalculate } = require("../services/calculationService");
const { parsePositiveInteger } = require("../utils/parsePositiveInteger");

exports.evaluate = async (req, res) => {
    const calculationId = parsePositiveInteger(req.params.calculationId);
    const result = await evaluateCalculation(pool, calculationId);
    return res.status(200).json({
        success: true,
        result
    })
}

exports.recalculate = async (req, res) => {
    const variableId = parsePositiveInteger(req.params.variableId);
    const result = await recalculate(pool, variableId);
    return res.status(200).json({
        success: true,
        result
    })
}