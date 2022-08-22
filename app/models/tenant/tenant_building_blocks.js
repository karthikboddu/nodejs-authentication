module.exports = (mongoose) => {

    const tenantBuildingBlocks = mongoose.model("tenant_building_blocks",
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
                                        block_name: {
                                            type: String,
                                            required :true
                                        },
                                        block_code: {
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


                                    return tenantBuildingBlocks;

}