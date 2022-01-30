const errorCode = require('../../common/errorCode'),
        {saveTenantBuildingsFloors} = require('../../services/tenant/floor.service');

exports.floors = async = (req, res, next) => {

}


exports.saveFloors = async (req, res, next) => {
    const floorData = req.body;
    const buildingId = req.params.buildingId;
    const blockId = req.params.blockId ? req.params.blockId : null;

    if (!floorData || !buildingId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }

    try {
        const result = await saveTenantBuildingsFloors(floorData, req.userId, buildingId, blockId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}