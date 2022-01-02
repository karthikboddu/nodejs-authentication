module.exports = (mongoose) => {

    const tenant = mongoose.model("tenant",
                    new mongoose.Schema({
                        parent_id: {
                            type: Number,
                        },
                        full_name: {
                        type: String,
                        required : false
                        },
                        username: {
                            type: String,
                            required : true
                        },
                        email: {
                            type: String,
                            required : true
                        },
                        password: {
                            type: String,
                            required : true
                        },
                        bio : {
                            type: String,
                            required : false
                        },
                        mobile_no: {
                            type: Number,
                            required : true
                        },
                        aadhar_id: {
                            type: String,
                            required : true
                        },
                        address: {
                            type: String,
                            required : true
                        },
                        start_at: {
                            type : Date,
                            default : Date.now,
                        },
                        end_at: {
                            type : Date,
                            default : Date.now,
                        },
                        status: {
                            type: String,
                            required : true
                        },
                        activated_at: {
                            type : Date,
                            default : Date.now,
                        },
                        last_login_at: {
                            type : Date,
                            default : Date.now,
                        },
                        created_at: {
                            type : Date,
                            default : Date.now,
                        },
                        updated_at: {
                            type : Date,
                            default : Date.now,
                        }

                    },
                    { timestamps: true }
                    ))

                    return tenant;
}