const db = require("../models"),
      Role = db.role,
      Promise = require('bluebird')
      tenant = db.tenant.tenantModel;


const loginTenant = async (userName) => {
        var now = new Date();
        try {
            return new Promise((resolve, reject) => {
                const tenantDetails = tenant.findOne({ username: userName,
                start_at: {
                '$lte': now
                },
                end_at : {
                    '$gte' : now
                }
                }).populate({ path: 'user_role', select: ['name'] })
                .exec((err, user) => {
                    resolve(user);
                });        
            })
        } catch(err) {
            console.log(err,"err")
            //throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }


module.exports = {
    loginTenant
}
