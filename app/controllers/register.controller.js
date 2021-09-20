const db = require('../models');

const user = db.User;


exports.create = (req,res)=>{

    const users = new user ({
        name : req.body.name,
        bio : req.boby.bio,
        email : req.body.emal,
        
    })
}
