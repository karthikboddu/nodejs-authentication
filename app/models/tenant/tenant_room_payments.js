module.exports = (mongoose) => {

    const tenantRoomPayments = mongoose.model("tenant_room_payments",
                            new mongoose.Schema({
                                tenant_id :{
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant"
                                },
                                parent_id :{
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
                                price: {
                                    type: Number,
                                    required :false
                                },
                                room_payment_type: {
                                    type: String,
                                    required :false,
                                    default: 'ROOM'
                                },
                                description: {
                                    type: String,
                                    required :false,
                                    default: ''
                                },
                                payment_for_date: {
                                    type : Date,
                                    default : Date.now,
                                },               
                                payment_status: {
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