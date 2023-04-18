const RequestModel = require("../models/emergency.model");

exports.getAllRequests = async () => {
    return await RequestModel.find();
};

exports.createRequest = async (request) => {
    return await RequestModel.create(request);
};
exports.getRequestById = async (id) => {
    return await RequestModel.findById(id);
};