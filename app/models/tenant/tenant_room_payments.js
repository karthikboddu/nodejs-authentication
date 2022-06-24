module.exports = (mongoose) => {

    const tenantRoomPayments = mongoose.model("tenant_room_payments",
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
                                room_contract_id: {
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant_room_contract"
                                },
                                actual_price: {
                                    type: Number,
                                    required :true
                                },
                                price: {
                                    type: Number,
                                    required :false
                                },
                                total_amount: {
                                    type: Number,
                                    required :false,
                                    default: 0
                                },
                                room_payment_type: {
                                    type: String,
                                    required :false,
                                    default: 'ROOM'
                                },
                                payment_for_date: {
                                    type : Date,
                                    default : Date.now,
                                },               
                                paymeny_status: {
                                    type: String,
                                    required :false,
                                    default: 'P'
                                },
                                status: {
                                    type: Boolean,
                                    default :true
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



    return tenantRoomPayments;
}