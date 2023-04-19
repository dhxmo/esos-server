const express = require("express");
const { getAllRequests, createRequest, getRequestById, getHealthCheck } = require("../controllers/emergency.controller")

const router = express.Router();

router.route("/").get(getAllRequests).post(createRequest);
router.route("/:id").get(getRequestById);
router.route("/ping").get(getHealthCheck);

module.exports = router;