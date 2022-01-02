const db = require("../../models"),
      tenant = db.tenant.tenantModel ,
      bcrypt = require("bcrypt"),
      Promise = require('bluebird');


const listTenants = async (req, res, userData) => {

    return new Promise((resolve, reject) => {
        tenant.find()
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.send({
                  message:
                    err.message || "Some error occurred while retrieving tutorials."
                });
              });
    })
}

const saveTenants = async (req, res, data) => {
    
    return new Promise((resolve, reject) => {
        try {
            const tenantObject = new tenant(
                {
                    parent_id : data.parentId ? data.parentId : null,
                    full_name : data.fullName ? data.fullName : '',
                    password :  bcrypt.hashSync(data.password, 8),
                    username : data.username,
                    email : data.email,
                    mobile_no : data.mobileNo,
                    aadhar_id : data.aadharId,
                    address : data.address,
                    status : true,
                })

                tenantObject.save((err,t) => {
                    if (err) {
                      res.status(500).send({ message: err });
                      return;
                    }
                    resolve({
                        status: 200,
                        data: t,
                        message: "Tenant was registered successfully!"
                      });
                  });
        } catch (error) {
            console.log(error)
        }

            

    });
}

module.exports = {
    listTenants,
    saveTenants
}