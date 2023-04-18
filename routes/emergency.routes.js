const express = require("express");
const { getAllRequests, createRequest, getRequestById } = require("../controllers/emergency.controllers")

const router = express.Router();

router.route("/").get(getAllRequests).post(createRequest);
router.route("/:id").get(getRequestById);

module.exports = router;