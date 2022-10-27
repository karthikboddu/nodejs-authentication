module.exports = (mongoose) => {

    const deliveryType = mongoose.model("delivery_type",
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

    return deliveryType;

}    