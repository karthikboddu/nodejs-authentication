const errorCode = require('../../common/errorCode'),
      {saveFloorRooms,listFloorRooms} = require('../../services/tenant/room.service');

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