module.exports = (mongoose) => {

    const contentType = mongoose.model("content_type",
        new mongoose.Schema({
            name: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            },
            is_active: {
                type: Boolean,
                default: true
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
            updated_at: {
                type: Date,
                default: Date.now
            }

        }))

    return contentType;

}    