const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { recalculate } = require("../controllers/calculationController");


const Router = express.Router();


// re-evaluates every calculation whose expression references this variable id.
Router.route("/:variableId/recalculate").post(asyncHandler(recalculate));

module.exports = Router;