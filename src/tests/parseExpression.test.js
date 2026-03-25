const { splitLeadingJsonObject, parseVariableRef } = require("../utils/parseExpression");
const { AppError } = require("../errors/AppError");

describe('parseExpression Utilities', () => {

    describe('splitLeadingJsonObject', () => {
        test('should correctly split JSON from arithmetic', () => {
            const input = '{"id": 1, "name": "test"} + 10 * 2';
            const result = splitLeadingJsonObject(input);
            
            expect(result.jsonText).toBe('{"id": 1, "name": "test"}');
            expect(result.arithmetic).toBe('+ 10 * 2');
        });

        test('should handle nested curly braces inside JSON', () => {
            const input = '{"data": {"id": 1}} * 5';
            const result = splitLeadingJsonObject(input);
            
            expect(result.jsonText).toBe('{"data": {"id": 1}}');
            expect(result.arithmetic).toBe('* 5');
        });

        test('should throw AppError if expression does not start with {', () => {
            expect(() => splitLeadingJsonObject('10 + 5')).toThrow(AppError);
            expect(() => splitLeadingJsonObject('10 + 5')).toThrow(/must start with a JSON object/);
        });

        test('should throw AppError if JSON object is not closed', () => {
            expect(() => splitLeadingJsonObject('{"id": 1 + 10')).toThrow(AppError);
            expect(() => splitLeadingJsonObject('{"id": 1 + 10')).toThrow(/not closed/);
        });

        test('should handle leading whitespace', () => {
            const input = '   {"id": 1} / 2';
            const result = splitLeadingJsonObject(input);
            expect(result.jsonText).toBe('{"id": 1}');
            expect(result.arithmetic).toBe('/ 2');
        });
    });

    describe('parseVariableRef', () => {
        test('should extract id and name from valid JSON text', () => {
            const jsonText = '{"id": 5, "name": "velocity"}';
            const result = parseVariableRef(jsonText);
            
            expect(result).toEqual({ id: 5, name: "velocity" });
        });

        test('should handle string IDs by parsing them to integers', () => {
            const jsonText = '{"id": "42"}';
            const result = parseVariableRef(jsonText);
            
            expect(result.id).toBe(42);
        });

        test('should throw AppError for invalid JSON syntax', () => {
            expect(() => parseVariableRef('{"id": 1,}')).toThrow(AppError);
            expect(() => parseVariableRef('{"id": 1,}')).toThrow(/Invalid JSON/);
        });

        test('should throw AppError if "id" is missing or invalid', () => {
            expect(() => parseVariableRef('{"name": "test"}')).toThrow(AppError);
            expect(() => parseVariableRef('{"id": 0}')).toThrow(AppError);
            expect(() => parseVariableRef('{"id": -5}')).toThrow(AppError);
            expect(() => parseVariableRef('{"id": "abc"}')).toThrow(/positive integer "id"/);
        });

        test('should return undefined for name if not provided', () => {
            const jsonText = '{"id": 10}';
            const result = parseVariableRef(jsonText);
            expect(result.name).toBeUndefined();
        });
    });
});