const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { getLineage } = require("../controllers/lineageController");




const Router = express.Router();


Router.route('/:resourceId').get(asyncHandler(getLineage))

module.exports = Router;