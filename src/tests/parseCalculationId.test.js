const { AppError } = require("../errors/AppError");
const { parseCalculationId } = require("../utils/parseCalculationId");


describe('parseCalculationId', () => {
    test('should parse valid positive integers', ()=>{
        expect(parseCalculationId('3')).toBe(3);
        expect(parseCalculationId(41)).toBe(41);
    });

    test('should throw AppError when it gets invalid input', ()=>{
        expect(() => parseCalculationId('xyz')).toThrow(AppError);
        expect(() => parseCalculationId(0)).toThrow(AppError);
        expect(() => parseCalculationId(-1)).toThrow(AppError);
        expect(() => parseCalculationId(null)).toThrow(AppError);
        expect(() => parseCalculationId('')).toThrow(AppError);
    })
})