module.exports = (mongoose) => {

    const lastConversation = mongoose.model("last_conversation",
                                new mongoose.Schema({
                                    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }],
                                    from_tenant_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant"
                                    },
                                    to_tenant_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant"
                                    },
                                    lastMessage: {
                                        type: String,
                                    },
                                    parent_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant"
                                    },
                                    seen: {
                                        type: Boolean,
                                        default :false
                                    },                         
                                    is_active: {
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

return lastConversation;

}