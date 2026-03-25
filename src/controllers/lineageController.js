const { getAncestorLineage } = require("../services/lineageService");
const pool = require("../config/db");
const { parsePositiveInteger } = require("../utils/parsePositiveInteger");


exports.getLineage = async (req, res) => {
    const resourceId = parsePositiveInteger(req.params.resourceId) ;
    const lineage = await getAncestorLineage(pool, resourceId)
    return res.status(200).json({
        resourceId,
        lineage
    })
}