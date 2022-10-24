module.exports = (mongoose) => {

    const asset = mongoose.model("asset",
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
            upload_id :{
                type : mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "upload"
            },
            name: {
                type: String,
                required :true
            },
            code: {
                type: String,
                required :true
            },
            hash: {
                type: String,
                required :true
            },
            asset_path: {
                type: String,
                required :true
            },
            asset_key: {
                type: String,
                required :true
            },
            asset_url: {
                type: String,
                required :false
            },
            version: {
                type: Number,
                required :true
            },
            content_type_id: {
                type : mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "content_type"
            },
            file_size: {
                type: Number,
                required :true
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
                default : Date.now
            }
        }))

        return asset;
    
    }     