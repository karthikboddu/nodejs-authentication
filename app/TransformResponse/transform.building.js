const _           = require('lodash');


const transformBuildingDetails = (record) => {
    return {
        "_id": "632db4ececbb1fe632f25b50",
        "tenant_id": "61f64f9af320710016814606",
        "building_name": "Murali Nivas",
        "building_address": "Jawaharnagar",
        "building_code": "MLR-JWHNGR",
        "building_image": "https://firebasestorage.googleapis.com/v0/b/react-native--signin-eb4b7.appspot.com/o/assets%2Fimages%2Fbuilding.png?alt=media&token=b7f5bcc7-2ca4-4a63-be9f-bfc20b834b44",
        "no_of_floors": 3,
        "no_of_rooms": 6,
        "total_amount": 47613,
        "status": true,
        "created_at": "2022-09-23T13:30:20.600Z",
        "updated_at": "2022-09-23T13:30:20.600Z",
        "__v": 0
    }
}


module.exports = {
    transformBuildingDetails
}