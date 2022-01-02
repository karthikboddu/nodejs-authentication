module.exports = (mongoose) => {

        const tenantBuildingFloors = mongoose.model("tenant_building_floors",
                                        new mongoose.Schema({
                                            tenant_id :{
                                                type : mongoose.Schema.Types.ObjectId,
                                                required: true,
                                                ref: "tenant"
                                            },
                                            building_id :{
                                                type : mongoose.Schema.Types.ObjectId,
                                                required: true,
                                                ref: "tenant_building"
                                            },
                                            block_id :{
                                                type : mongoose.Schema.Types.ObjectId,
                                                required: true,
                                                ref: "tenant_building_blocks",
                                                default: null
                                            },
                                            floor_name: {
                                                type: String,
                                                required :true
                                            },
                                            floor_code: {
                                                type: String,
                                                required :true
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

                                        return tenantBuildingFloors;
}