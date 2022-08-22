module.exports = mongoose => {

    var schema = mongoose.Schema(
        {
            name : {
                type : String,
                required : true
            },
            key : {
                type : String,
                required : true,
                unique: true
            },
            value : {
                type : String,
                required : true
            },
            type : {
                enum: ['AUTH'],

            },
            status : {
                type : Boolean,
                default :false
            },
            createdAt : {
                type : Date,
                default : Date.now,
            },
            modifiedAt : {
                type : Date,
                default : Date.now,
            },            
        },
        { timestamps: true }
    );
    schema.method("toJSON",function() {
        const { __v, _id, ...object} = this.toObject();
        object.id = _id;
        return object;
       });    

    const Configs =  mongoose.model("Configs",schema);
    return Configs;

};