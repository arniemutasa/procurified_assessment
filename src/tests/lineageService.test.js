const { AppError } = require("../errors/AppError");
const {getAncestorLineage} = require("../services/lineageService");


describe('getAncestorLinage', ()=>{
    // test successful linage retreival
    test('returns lineage root to parent (example id: 3 -> [1, 2])', async () => {
        // Mock PG Connection Pool
        const mockPool = {
            query: jest.fn().mockResolvedValue({
                rows: [{found: true, lineage: [1,2]}]
            })
        }

        const output = await getAncestorLineage(mockPool, 3);

        expect(output).toEqual([1,2]);
        expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    // Test root resource i.e empty lineage
    test('returns empty array for root resource', async ()=>{
        const mockPool = {
            query: jest.fn().mockResolvedValue({
                rows: [{found: true, lineage: []}]
            })
        }

        const output = await getAncestorLineage(mockPool, 1);
        expect(output).toEqual([]);

    });

    // Test missing resource
    test('throws 404 error when resource is missing', async () =>{
        const mockPool = {
            query: jest.fn().mockResolvedValue({
                rows: [{found: false, lineage: null}]
            })
        }

        // using .rejects 
        await expect(getAncestorLineage(mockPool, 999)).rejects.toThrow(AppError);

    })
})