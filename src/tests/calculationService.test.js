const math = require("mathjs");
const { evaluateCalculation, expressionToFormula } = require("../services/calculationService");
const { AppError } = require("../errors/AppError");
const { splitLeadingJsonObject, parseVariableRef } = require("../utils/parseExpression");

// Mock the utility functions
jest.mock("../utils/parseExpression");

describe('calculationService', () => {
    let mockPool;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Create a mock pool with a query function
        mockPool = {
            query: jest.fn()
        };
    });

    describe('expressionToFormula', () => {
        test('should correctly convert expression to a numeric formula string', async () => {
            const expression = '{ "id": 1 } + 10 * 2';
            
            // Mock utilities to simulate splitting and parsing
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{ "id": 1 }', arithmetic: '+ 10 * 2' });
            parseVariableRef.mockReturnValue({ id: 1 });

            // Mock database response for the variable lookup [cite: 45, 52]
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
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{ "id": 99 }', arithmetic: '+ 5' });
            parseVariableRef.mockReturnValue({ id: 99 });
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(expressionToFormula(mockPool, '...'))
                .rejects.toThrow(new AppError('Variable not found', 404));
        });
    });

    describe('evaluateCalculation', () => {
        test('should evaluate expression and persist the result to the database', async () => {
            const calculationId = 1;
            const mockCalculation = { 
                id: 1, 
                name: 'Test Calc', 
                expression: '{ "id": 1 } + 10 * 2' 
            };

            // 1. Mock SELECT_CALCULATION [cite: 51]
            mockPool.query.mockResolvedValueOnce({ rows: [mockCalculation] });

            // 2. Mock SELECT_VARIABLE_VALUE (called inside expressionToFormula) [cite: 52]
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{ "id": 1 }', arithmetic: '+ 10 * 2' });
            parseVariableRef.mockReturnValue({ id: 1 });
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, value: 2.5 }] });

            // 3. Mock UPDATE_CALCULATED_VALUE [cite: 48, 53]
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const result = await evaluateCalculation(mockPool, calculationId);

            // Verify calculation logic: 2.5 + 10 * 2 = 22.5 [cite: 47, 48]
            expect(result.calculatedValue).toBe(22.5);
            expect(result.variableValue).toBe(2.5);
            
            // Verify database update was called with correct result [cite: 62]
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [22.5, 1]);
        });

        test('should throw 400 if mathjs fails to evaluate the formula', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, expression: 'bad' }] });
            
            // Force expressionToFormula to return a broken formula
            splitLeadingJsonObject.mockReturnValue({ jsonText: '{}', arithmetic: 'invalid syntax' });
            parseVariableRef.mockReturnValue({ id: 1 });
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, value: 5 }] });

            await expect(evaluateCalculation(mockPool, 1))
                .rejects.toThrow(/Failed to evaluate expression/);
        });

        test('should throw 404 if calculation record is not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(evaluateCalculation(mockPool, 404))
                .rejects.toThrow(new AppError('Calculation not found', 404));
        });
    });
});