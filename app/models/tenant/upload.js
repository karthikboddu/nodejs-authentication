module.exports = (mongoose) => {

    const upload = mongoose.model("upload",
        new mongoose.Schema({
            tenant_id :{
                type : mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "tenant"
            },
            parent_id :{
                type : mongoose.Schema.Types.ObjectId,
                required: false,
                ref: "tenant"
            },
            code: {
                type: String,
                required :true
            }, 
            type: {
                type: String,
                required :true
            },
            size: {
                type: Number,
                required :true
            },  
            error_details: {
                type: String,
                required :false
            },
            status: {
                type: String,
                required :true
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

    return upload;

}                                    