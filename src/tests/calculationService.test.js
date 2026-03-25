const math = require("mathjs");
const { evaluateCalculation, expressionToFormula, variableRefSqlPattern, recalculate } = require("../services/calculationService");
const { AppError } = require("../errors/AppError");
const { splitLeadingJsonObject, parseVariableRef } = require("../utils/parseExpression");

// Mock the utility functions
jest.mock("../utils/parseExpression");

describe('calculationService', () => {
    let mockPool;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPool = { query: jest.fn() };

        // Set Sane Defaults for Mocks so mathjs doesn't crash in other tests
        splitLeadingJsonObject.mockReturnValue({ jsonText: '{"id":1}', arithmetic: '+ 0' });
        parseVariableRef.mockReturnValue({ id: 1 });
    });

    describe('expressionToFormula', () => {
        test('should correctly convert expression to a numeric formula string', async () => {
            const expression = '{ "id": 1 } + 10 * 2';
            
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{ "id": 1 }', arithmetic: '+ 10 * 2' });
            parseVariableRef.mockReturnValue({ id: 1 });

            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: 1, name: 'variableName', value: 2.5 }]
            });

            const result = await expressionToFormula(mockPool, expression);

            expect(result).toEqual({
                formula: '2.5 + 10 * 2',
                variableId: 1,
                variableValue: 2.5
            });
            expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1]);
        });

        test('should throw 404 if the referenced variable does not exist', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            await expect(expressionToFormula(mockPool, '...'))
                .rejects.toThrow(new AppError('Variable not found', 404));
        });
    });

    describe('evaluateCalculation', () => {
        test('should evaluate expression and persist the result to the database', async () => {
            const calculationId = 1;
            const mockCalculation = { id: 1, name: 'Test Calc', expression: '{ "id": 1 } + 10 * 2' };

            mockPool.query.mockResolvedValueOnce({ rows: [mockCalculation] });
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{ "id": 1 }', arithmetic: '+ 10 * 2' });
            parseVariableRef.mockReturnValue({ id: 1 });
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, value: 2.5 }] });
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const result = await evaluateCalculation(mockPool, calculationId);

            expect(result.calculatedValue).toBe(22.5);
            expect(result.variableValue).toBe(2.5);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [22.5, 1]);
        });

        test('should throw 400 if mathjs fails to evaluate the formula', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, expression: 'bad' }] });
            // Explicitly set a bad formula for THIS test only
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{}', arithmetic: 'invalid_syntax' });
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, value: 5 }] });

            await expect(evaluateCalculation(mockPool, 1))
                .rejects.toThrow(/Failed to evaluate expression/);
        });
    });

    describe('recalculate', () => {
        test('should find and update all calculations referencing a specific variable', async () => {
            const variableId = 1;
            
            // 1. Force valid mock returns for this test so mathjs succeeds
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{"id":1}', arithmetic: '+ 5' });
            parseVariableRef.mockReturnValue({ id: 1 });

            // 2. Sequence of DB calls
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 101 }] }); // Search
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 101, name: 'C1', expression: '...' }] }); // Load
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, value: 10 }] }); // Variable
            mockPool.query.mockResolvedValueOnce({ rows: [] }); // Update

            const result = await recalculate(mockPool, variableId);

            expect(result.updated).toBe(1); 
            expect(result.results[0].calculatedValue).toBe(15); 
        });

        test('should return zero updates if no calculations reference the variable', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const result = await recalculate(mockPool, 5);
            expect(result.updated).toBe(0);
        });
    });

    describe('variableRefSqlPattern', () => {
        test('should create a pattern that matches the exact ID', () => {
            const pattern = variableRefSqlPattern(1);
            const regex = new RegExp(pattern);
            expect(regex.test('"id":1')).toBe(true);
            expect(regex.test('"id": 1')).toBe(true);
            expect(regex.test('"id":10')).toBe(false);
        });
    });
});