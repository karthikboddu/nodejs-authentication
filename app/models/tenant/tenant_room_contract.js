module.exports = (mongoose) => {

    const tenantRoomContract = mongoose.model("tenant_room_contract",
                            new mongoose.Schema({
                                tenant_id :{
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant"
                                },
                                floor_room_id: {
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant_floor_rooms"
                                },
                                advance_amount: {
                                    type: Number,
                                    required :true
                                },
                                advance_paid: {
                                    type: Boolean,
                                    required :true,
                                    default: false
                                },
                                actual_price: {
                                    type: Number,
                                    required :true
                                },
                                price: {
                                    type: Number,
                                    required :false
                                },
                                no_of_persons: {
                                    type: Number,
                                    required :false
                                },
                                total_amount: {
                                    type: String,
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



    return tenantRoomContract;
}