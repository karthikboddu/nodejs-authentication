const errorCode = require('../../common/errorCode'),
      {saveFloorRooms,listFloorRooms,saveTenantRoomContract,listRoomDetails} = require('../../services/tenant/room.service');

exports.createRoom = async (req, res , next) => {
    const roomData = req.body;
    const floorId = req.params.floorId;
    if (!floorId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await saveFloorRooms(roomData, req.userId, floorId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.rooms = async(req, res, next) => {
    const floorId = req.params.floorId;
    if (!floorId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await listFloorRooms(req.userId, floorId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.linkTenantRoom = async(req, res, next) => {
    const roomId = req.params.roomId;
    const tenantId = req.params.tenantId;
    const roomTenantData = req.body;
    if (!roomId || !tenantId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await saveTenantRoomContract(roomTenantData, req.userId, roomId,tenantId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}


exports.floorRoomListDetails = async (req, res, next) => {
    const floorId = req.params.floorId;
    if (!floorId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await listRoomDetails(req.userId, floorId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.roomDetails = async (req, res, next) => {
    const roomId = req.params.roomId;
    if (!roomId) {
        res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await fetchRoomDetails(req.userId, roomId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}