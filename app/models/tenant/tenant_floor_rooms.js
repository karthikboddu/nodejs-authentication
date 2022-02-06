module.exports = (mongoose) => {

    const tenantFloorRooms = mongoose.model("tenant_floor_rooms",
                                new mongoose.Schema({
                                    tenant_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant"
                                    },
                                    building_floor_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant_building_floors"
                                    },
                                    room_name: {
                                        type: String,
                                        required :true
                                    },
                                    room_code: {
                                        type: String,
                                        required :true
                                    },
                                    default_no_of_persons: {
                                        type: Number,
                                        required :true,
                                        default: 3
                                    },                                    
                                    status: {
                                        type: Boolean,
                                        default :false
                                    },
                                    created_at: {
                                        type : Date,
                                        default : Date.now,
                                    },
                                    updated_at: {
                                        type : Date,
                                        default : Date.now,
                                    }
                                }))

                                return tenantFloorRooms;
}