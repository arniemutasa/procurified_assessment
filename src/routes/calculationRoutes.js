const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { evaluate } = require("../controllers/calculationController");


const Router = express.Router();

Router.route("/:calculationId/evaluate").post(asyncHandler(evaluate));


module.exports = Router;