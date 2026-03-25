const math = require("mathjs");
const { AppError } = require("../errors/AppError");
const { splitLeadingJsonObject, parseVariableRef } = require("../utils/parseExpression");


const SELECT_CALCULATION = `
    SELECT id, name, expression, calculated_value 
    FROM calculations where id = $1 
`;

const SELECT_VARIABLE_VALUE = `
    SELECT id, name, value
    FROM variables
    WHERE id = $1
`;

const UPDATE_CALCULATED_VALUE = `
    UPDATE calculations
    SET calculated_value = $1
    WHERE id = $2
`;

const evaluateCalculation = async (pool, calculationId) => {
    const {rows} = await pool.query(SELECT_CALCULATION, [calculationId]);
    const calculation = rows[0];
    if(!calculation){
        throw new AppError('Calculation not found', 404);
    }

    const {formula, variableId, variableValue} = await expressionToFormula(pool, calculation.expression);
    console.log(formula, variableId, variableValue);


    let calculated;

    try {
        calculated = math.evaluate(formula);
    } catch (err) {
        throw new AppError(
        `Failed to evaluate expression: ${err.message || err}`,
        400
        );
    }

    if (Number.isNaN(calculated) || !Number.isFinite(calculated)) {
        throw new AppError('Expression did not evaluate to a finite number', 400);
    }

    // persist the calculation in the db
    await pool.query(UPDATE_CALCULATED_VALUE, [calculated, calculationId]);

    return {
        id: calculation.id,
        name: calculation.name,
        expression: calculation.expression,
        variableId,
        variableValue,
        calculatedValue: calculated
    }

}


// Get formula out of expression text
const expressionToFormula = async (pool, expression) => {

    //Slice expression into jsonText and arithmetic parts
    const { jsonText, arithmetic } = splitLeadingJsonObject(expression);

    // Get variable reference from json
    const ref = parseVariableRef(jsonText);


    const {rows} = await pool.query(SELECT_VARIABLE_VALUE, [ref.id]);
    const row = rows[0];


    if(!row){
        throw new AppError(`Variable not found`, 404)
    }

    const value = Number(row.value);
    if(Number.isNaN(value)){
        throw new AppError(`The value of variable ${ref.id} is Not A Number`, 400);
    }

    const formula = `${value} ${arithmetic}`.trim();

    return {formula, variableId: ref.id, variableValue: value}
}



module.exports = {
    evaluateCalculation,
    expressionToFormula
}
