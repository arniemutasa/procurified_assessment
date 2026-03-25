const { AppError } = require("../errors/AppError");
const { parseResourceId } = require("../utils/parseResourceId")


describe('parseResourceId', () => {
    test('should parse valid positive integers', ()=>{
        expect(parseResourceId('3')).toBe(3);
        expect(parseResourceId(41)).toBe(41);
    });

    test('should throw AppError when it gets invalid input', ()=>{
        expect(() => parseResourceId('xyz')).toThrow(AppError);
        expect(() => parseResourceId(0)).toThrow(AppError);
        expect(() => parseResourceId(-1)).toThrow(AppError);
        expect(() => parseResourceId(null)).toThrow(AppError);
        expect(() => parseResourceId('')).toThrow(AppError);
    })
})