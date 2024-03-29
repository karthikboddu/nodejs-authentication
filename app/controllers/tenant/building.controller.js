const errorCode = require('../../common/errorCode'),
    { saveTenantBuildings, listTenantBuildings, saveTenantBuildingsBlocks, listTenantBuildingsById,listTenantBuildingsBlocks, patchTenantBuildings } = require('../../services/tenant/building.service');

exports.buildings = async (req, res, next) => {
    try {
        console.log(req.userId)
        const tenantId = req.query.tenantId ? req.query.tenantId : req.userId;
        const result = await listTenantBuildings(tenantId);
        res.api.data = result;
        res.send(res.api);
    } catch (error) {
        return res.send(error);
    }
}

exports.createTenantBuildings = async (req, res, next) => {

    const buildingData = req.body;
    console.log(req.userId)
    if (!buildingData) {
        res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    try {
        const result = await saveTenantBuildings(buildingData, req.userId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.updateTenantBuilding = async (req, res, next) => {
    const buildingData = req.body;
    const buildingId = req.params.buildingId;
    if (!buildingData || !buildingId) {
        res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    try {
        const result = await patchTenantBuildings(buildingData, req.userId, buildingId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.createTenantBuildingsBlocks = async (req, res, next) => {
    const buildingBlocksData = req.body;
    const buildingId = req.params.buildingId;
    console.log(buildingBlocksData)
    if (!buildingBlocksData || !req.params.buildingId) {
        res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    try {
        const result = await saveTenantBuildingsBlocks(buildingBlocksData, req.userId, buildingId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.buildingsBlocks = async (req, res, next) => {
    try {
        console.log(req.userId)
        const buildingId = req.params.buildingId;
        if (!req.params.buildingId || !req.userId) {
            res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
        }
        const result = await listTenantBuildingsBlocks(req.userId, buildingId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.tenantBuildingById = async (req,res, next) => {
    try {
        const buildingId = req.params.buildingId;
        if (!req.params.buildingId || !req.userId) {
            return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
        }
        if (!res.mongoose.Types.ObjectId.isValid(buildingId)) {
            return res.status(404).send({ status: 404, message: errorCode.NOT_FOUND });
        }
        const result = await listTenantBuildingsById(req.userId, buildingId);
        
        res.api.data = {
            building : result
        };
        res.send(res.api);
    } catch (error) {
        console.log(error)
        return res.send(error);
    }
}