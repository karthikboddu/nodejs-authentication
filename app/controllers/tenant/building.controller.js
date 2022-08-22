const errorCode = require('../../common/errorCode'),
    { saveTenantBuildings, listTenantBuildings, saveTenantBuildingsBlocks, listTenantBuildingsById,listTenantBuildingsBlocks } = require('../../services/tenant/building.service');

exports.buildings = async (req, res, next) => {
    try {
        console.log(req.userId)
        const result = await listTenantBuildings(req);
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
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }

    try {
        const result = await saveTenantBuildings(buildingData, req.userId);
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
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
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
            res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
        }
        const result = await listTenantBuildingsBlocks(req.userId, buildingId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.tenantBuildingById = async (req,res, next) => {
    try {
        console.log(req.userId)
        const buildingId = req.params.buildingId;
        if (!req.params.buildingId || !req.userId) {
            res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
        }
        const result = await listTenantBuildingsById(req.userId, buildingId);
        console.log(result,"res")
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}