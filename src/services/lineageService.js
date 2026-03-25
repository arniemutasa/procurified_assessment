const { AppError } = require("../errors/AppError");

const LINEAGE_QUERY = `
WITH RECURSIVE chain AS (
    SELECT id, "parentId", 0 as depth
    FROM singleresource
    WHERE id = $1
    UNION ALL
    SELECT p.id,p."parentId",c.depth + 1
    FROM singleresource p
    INNER JOIN chain c ON p.id = c."parentId"
)
SELECT 
    EXISTS(SELECT 1 FROM chain) AS found,
    COALESCE(
        ARRAY(
            SELECT id FROM chain WHERE id <> $1
            ORDER BY depth DESC
        ),
        ARRAY[]::integer[]
    ) AS lineage;
`;


// We pass the pool as an arg in order to make the function testable with mock db pool
const getAncestorLineage = async (pool, resourceId) => {
    const {rows} = await pool.query(LINEAGE_QUERY, [resourceId]);
    const row = rows[0];
    if(!row || !row.found){
        throw new AppError('Resource Not Found', 404)
    }

    return row.lineage;
}

module.exports = {getAncestorLineage, LINEAGE_QUERY}