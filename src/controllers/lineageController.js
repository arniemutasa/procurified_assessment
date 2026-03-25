const { getAncestorLineage } = require("../services/lineageService");
const pool = require("../config/db");
const {parseResourceId} = require("../utils/parseResourceId");


exports.getLineage = async (req, res) => {
    const resourceId = parseResourceId(req.params.resourceId) ;
    const lineage = await getAncestorLineage(pool, resourceId)
    return res.status(200).json({
        resourceId,
        lineage
    })
}