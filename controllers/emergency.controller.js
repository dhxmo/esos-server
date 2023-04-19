const requestService = require("../services/emergency.service");

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await requestService.getAllRequests();
        res.json({ data: requests, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const request = await requestService.createRequest(req.body);
        res.json({ data: request, status: "success" });
        console.log(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const request = await requestService.getRequestById(req.params.id);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHealthCheck = async (req, res) => {
    res.json({ data: "pong", status: "success" })
}