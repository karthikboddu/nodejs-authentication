const db = require("../../models"),
      Role = db.role,
      tenant = db.tenant.tenantModel ,
      bcrypt = require("bcrypt"),
      Promise = require('bluebird'),
      {jwtSignAccessRefreshTokenTenant } = require('../../helpers/jwt_helpers');

const listTenants = async (res) => {

    return new Promise((resolve, reject) => {
        tenant.find()
            .then(d => {
                resolve({ status: 200, data: d})
            })
            .catch(err => {
                reject({
                    status: 500,
                    message:
                      err.message || "Some error occurred while retrieving tutorials."
                  })
              });
    })
}

const saveTenants = async (data,role,parentId) => {
    
    return new Promise((resolve, reject) => {
        try {

            const tenantObject = new tenant(
                {
                    parent_id : parentId ? parentId : null,
                    full_name : data.fullName ? data.fullName : '',
                    password :  bcrypt.hashSync(data.password, 8),
                    user_role : role._id,
                    username : data.username,
                    email : data.email,
                    mobile_no : data.mobileNo,
                    aadhar_id : data.aadharId,
                    address : data.address,
                    status : true,
                })


            const checkusername = data.username;
            tenant.findOne({ username: checkusername })
            .then(existingTenant => {
                if (existingTenant) {
                    reject ({ status: 404, message: 'Tenant already exists' })
                    
                } else {
                    tenantObject.save((err,t) => {
                        if (err) {
                          reject({ status: 500, message: err })
                          return;
                        }
                        resolve({
                            status: 200,
                            data: t,
                            message: "Tenant was registered successfully!"
                          });
                      });
                }
            })
            .catch(err => {
                reject({
                    status: 500,
                    message:
                      err.message || "Some error occurred while retrieving tutorials."
                  })
              });

        } catch (error) {
            reject({ status: 500, message: error })
            console.log(error)
        }          
    });
}

const logInTenants = async(data) => {
    return new Promise((resolve, reject) => {
        tenant.findOne({
          username: data.username
        }).populate({ path: 'user_role', select: ['name'] })
          .exec((err, user) => {
            if (err) {
              reject({ status: 500, message: err });
            }
            if (!user || user == null) {
              reject({ status: 404, message: "User Not found." });
              return;
            }
            var pass = data.password
            //pass = pass.replace(/^"|"$/g, '');
            var passwordIsValid = bcrypt.compareSync(
              pass,
              user.password
            );
            if (!passwordIsValid) {
              reject({
                status: 403,
                data: '',
                message: "Invalid Password!"
              });
            }
            const jwtData = jwtSignAccessRefreshTokenTenant(user.id,user.user_role.name,user.full_name)
            resolve({ status: 200, data: jwtData })
          });
      });
}

module.exports = {
    listTenants,
    saveTenants,
    logInTenants
}