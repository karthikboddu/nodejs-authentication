module.exports = (mongoose) => {

    const userNotes = mongoose.model("user_notes",
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
                                    title: {
                                        type: String,
                                        required :true
                                    },  
                                    description: {
                                        type: String,
                                        required :false
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

return userNotes;

}