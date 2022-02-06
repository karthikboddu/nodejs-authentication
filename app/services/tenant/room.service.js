const db = require("../../models"),
      tenantFloorRooms = db.tenant.tenantFloorRooms ;


const saveFloorRooms = async (data, tenantId, floorId) => {
    return new Promise((resolve, reject) => {

        try {
            const tenantFloorRoomsObject = new tenantFloorRooms(
                {
                    tenant_id : tenantId,
                    building_floor_id : floorId,
                    room_name : data.roomName,
                    room_code : data.roomCode,
                    status : true
                })

                const checkRoomCode = data.roomCode;
                tenantFloorRooms.findOne({ room_code: checkRoomCode })
                .then(existingRoom => {
                    if (existingRoom) {
                        reject ({ status: 404, message: 'Tenant Room already exists' })
                        
                    } else {
                        tenantFloorRoomsObject.save((err,t) => {
                            if (err) {
                              reject({ status: 500, message: err })
                              return;
                            }
                            resolve({
                                status: 200,
                                data: t,
                                message: "Tenant Room was registered successfully!"
                              });
                          });
                    }
                })
                .catch(err => {
                    reject({
                        status: 500,
                        message:
                          err.message || "Some error occurred while retrieving."
                      })
                  });


        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }

    });
}

const listFloorRooms = async (tenantId, floorId) => {
    return new Promise((resolve, reject) => {
        tenantFloorRooms.find({ tenant_id: tenantId,building_floor_id:  floorId})
            .then(d => {
                resolve({ status: 200, data: d})
            })
            .catch(err => {
                reject({
                    status: 500,
                    message:
                      err.message || "Some error occurred while retrieving tutorials."
                  })
              });
    })
}

module.exports = {
    saveFloorRooms,
    listFloorRooms
}