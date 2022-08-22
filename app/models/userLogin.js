module.exports = mongoose => {

    var schema = mongoose.Schema(
      {
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "User",
        }, 
        tokenId: {
            type : String,
            required : true
        },
        ipAddress : {
            type : String,
            required : true
        },
        device : {
            type :String,
            required : true
        },
        loggedinAt : {
            type : Date,
            default : Date.now,
        },
        loggedoutAt : {
            type : Date,
            default : Date.now,
        },
        islogout : {
            type : Boolean,
            default :false
        }
      },
      { timestamps: true }
    );
  
  schema.method("toJSON",function() {
   const { __v, _id, ...object} = this.toObject();
   object.id = _id;
   return object;
  });
  
  const UserLogin =  mongoose.model("UserLogin",schema);
  
  
  
  return UserLogin;
  
  };