

module.exports = (mongoose,dbConfig) => {

    const db = {};
    db.mongoose = mongoose;
    
    db.url = dbConfig.url;
    db.tenantModel = require('./tenant.model')(mongoose);
    db.tenantBuilding = require('./tenant_building')(mongoose);
    db.tenantBuildingBlocks = require('./tenant_building_blocks')(mongoose);
    db.tenantBuildingFloors = require('./tenant_building_floors')(mongoose);
    db.tenantFloorRooms = require('./tenant_floor_rooms')(mongoose);
    db.tenantRoomContract = require('./tenant_room_contract')(mongoose);
    db.orderMaster = require('./order_master')(mongoose);
    db.tenantRoomPayments = require('./tenant_room_payments')(mongoose);
    db.userConversation = require('./user_conversation')(mongoose);
    db.lastConversation = require('./last_conversation')(mongoose);
    return db
}