module.exports = (mongoose) => {

    const tenant = mongoose.model("tenant",
                    new mongoose.Schema({
                        parent_id: {
                            type : mongoose.Schema.Types.ObjectId,
                            required: true,
                            ref: "tenant"
                        },
                        user_role: {
                            type : mongoose.Schema.Types.ObjectId,
                            required: true,
                            ref: "Role"
                        },
                        full_name: {
                            type: String,
                            required : false
                        },
                        username: {
                            type: String,
                            required : true,
                            unique: true
                        },
                        email: {
                            type: String,
                            required : true,
                            unique: true
                        },
                        password: {
                            type: String,
                            required : false
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
                            required : false
                        },
                        address: {
                            type: String,
                            required : true
                        },
                        photoUrl: {
                            type: String,
                            required : false
                        },
                        userType: {
                            type: String,
                            required : false,
                            default : 'INTERNAL'
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
                            type: Boolean,
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