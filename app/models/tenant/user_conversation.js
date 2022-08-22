module.exports = (mongoose) => {

    const userConversation = mongoose.model("user_conversation",
                                new mongoose.Schema({
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
                                    parent_id :{
                                        type : mongoose.Schema.Types.ObjectId,
                                        required: true,
                                        ref: "tenant"
                                    },
                                    text: {
                                        type: String,
                                        required :true
                                    },
                                    asset_url: {
                                        type: String,
                                        required :false
                                    },
                                    asset_type: {
                                        type: String,
                                        required :false
                                    },
                                    seen: {
                                        type: Boolean,
                                        default :false
                                    },    
                                    sent: {
                                        type: Boolean,
                                        default :false
                                    },  
                                    received: {
                                        type: Boolean,
                                        default :false
                                    },   
                                    pending: {
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

return userConversation;

}