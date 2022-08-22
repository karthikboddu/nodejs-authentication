module.exports = (mongoose) => {

    const tenantBuilding = mongoose.model("tenant_building",
                            new mongoose.Schema({
                                tenant_id :{
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant"
                                },
                                building_name: {
                                    type: String,
                                    required :true
                                },
                                building_address: {
                                    type: String,
                                    required :true
                                },
                                building_code: {
                                    type: String,
                                    required :true
                                },
                                building_image: {
                                    type: String,
                                    required :true
                                },
                                no_of_floors: {
                                    type: Number,
                                    required :false
                                },
                                no_of_rooms: {
                                    type: Number,
                                    required :false
                                },
                                total_amount: {
                                    type: Number,
                                    required :false
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

                            return tenantBuilding;

}