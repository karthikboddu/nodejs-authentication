const errorCode = require('../../common/errorCode'),
      {saveFloorRooms,listFloorRooms,saveTenantRoomContract,listRoomDetails,fetchRoomDetails,fetchTenantRoomDetails, unlinkTenantRoomContract, updateRoomDetailsByRoomId} = require('../../services/tenant/room.service');
const { getPagination } = require('../../common/util');

exports.createRoom = async (req, res , next) => {
    const roomData = req.body;
    const floorId = req.params.floorId;
    if (!floorId) {
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
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
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
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
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
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
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
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
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    const roomPaymentId = req.query.roomPaymentId ?  req.query.roomPaymentId  : null;
    try {
        const result = await fetchRoomDetails(req.userId, roomId, roomPaymentId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}

exports.tenantRoomDetails = async (req, res, next) => {
    try {
        const status = req.query.paymentStatus ? req.query.paymentStatus : 'P';
        let {page, size} = req.query;
        if (!page) {
            page = 1;
        }
        if (!size) {
            size = 10;
        }

        const limit = parseInt (size);
        const skip = (page - 1) * size;

        const result = await fetchTenantRoomDetails(req.userId, status, limit, skip);
        const totalCount = result.data.orderDetails ? result.data.orderDetails.length : 0;
        const pagination = getPagination(page, size, totalCount);
        result.data._pagination = pagination;
        console.log(totalCount)
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}


exports.unLinkTenantRoomContract = async(req, res, next) => {

    const roomTenantData = req.body;
    if (!roomTenantData.contractId || !roomTenantData.tenantId) {
        console.log("ASd")
        return res.status(500).send({ status: 500, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await unlinkTenantRoomContract(roomTenantData, req.userId);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}


exports.updateRoomDetails = async(req, res, next) => {

    const roomId = req.params.roomId;
    if (!roomId) {
        return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }

    const roomData = req.body;

    if (Object.keys(roomData).length == 0) {
        return res.status(400).send({ status: 400, message: errorCode.BAD_REQUEST });
    }
    try {
        const result = await updateRoomDetailsByRoomId(req.userId, roomId, roomData);
        res.send(result);
    } catch (error) {
        return res.send(error);
    }
}
