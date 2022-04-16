module.exports = (mongoose) => {

    const orderMaster = mongoose.model("order_master",
                            new mongoose.Schema({
                                tenant_id :{
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant"
                                },
                                room_contract_id: {
                                    type : mongoose.Schema.Types.ObjectId,
                                    required: true,
                                    ref: "tenant_room_contract"
                                },
                                payment_type: {
                                    type: String,
                                    required :false,
                                    default: 'PAYTM'
                                },
                                amount_paid: {
                                    type: Number,
                                    required :true,
                                },
                                ref_transaction_id: {
                                    type: Number,
                                    required :false,
                                    default: null
                                },
                                payment_status: {
                                    type: String,
                                    required :false,
                                    default: 'P'
                                },
                                total_amount: {
                                    type: Number,
                                    required :false,
                                    default: 0
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



    return orderMaster;
}