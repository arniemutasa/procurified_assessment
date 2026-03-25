const { AppError } = require("../errors/AppError");
const { parsePositiveInteger } = require("../utils/parsePositiveInteger");




describe('parsePositiveInteger', () => {
    test('should parse valid positive integers', ()=>{
        expect(parsePositiveInteger('3')).toBe(3);
        expect(parsePositiveInteger(41)).toBe(41);
    });

    test('should throw AppError when it gets invalid input', ()=>{
        expect(() => parsePositiveInteger('xyz')).toThrow(AppError);
        expect(() => parsePositiveInteger(0)).toThrow(AppError);
        expect(() => parsePositiveInteger(-1)).toThrow(AppError);
        expect(() => parsePositiveInteger(null)).toThrow(AppError);
        expect(() => parsePositiveInteger('')).toThrow(AppError);
    })
})