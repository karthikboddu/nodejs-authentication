const db = require("../../models"),
      Role = db.role,
      tenant = db.tenant.tenantModel ,
      tenantRoomContract = db.tenant.tenantRoomContract,
      bcrypt = require("bcrypt"),
      Promise = require('bluebird'),
      {jwtSignAccessRefreshTokenTenant } = require('../../helpers/jwt_helpers'),
      {loginTenant} = require('../../repository/UserRepository');

const listTenants = async (req, limit, skip, buildingId) => {

    return new Promise((resolve, reject) => {
      var parentId = req.userId;

      tenantRoomContract.find({parent_id :parentId, building_id: buildingId, status:true}).populate({ path: 'tenant_id', select: ['username','full_name','email','mobile_no','address','start_at','end_at','created_at'] })
        .limit(limit).skip(skip).sort({updated_at: -1})
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
  console.log(data,"data")
    return new Promise((resolve, reject) => {
      var now = new Date();
      
      const use = loginTenant(data.username);
      console.log(use,"now")
      tenant.findOne({ username: data.username,
         start_at: {
        '$lte': now
        },
        end_at : {
          '$gte' : now
        }
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
            console.log(pass)
            pass = pass.replace(/^"|"$/g, '');
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
            const jwtData = jwtSignAccessRefreshTokenTenant(user.id,user.user_role.name,user.full_name, user.parent_id)
            if (user.user_role.name == 'admin') {
              jwtData.isAdmin = true
            } else {
              jwtData.isAdmin = false
            }
            resolve({ status: 200, data: jwtData })
          });
      });
}


const saveSSOTenants = async (data,role,parentId) => {
    
  return new Promise((resolve, reject) => {
      try {

        tenant.findOne({
          email: data.email
        }).populate({ path: 'user_role', select: ['name'] })
          .exec((err, user) => {
            if (err) {
              reject({ status: 500, message: err });
            }
            if (!user || user == null) {

              const tenantObject = new tenant(
                {
                    parent_id : parentId ? parentId : null,
                    full_name : data.fullName ? data.fullName : '',
                    password :  '',
                    user_role : role._id,
                    username : data.username,
                    email : data.email,
                    mobile_no : data.mobileNo ? data.mobileNo : 9999999999,
                    aadhar_id : data.aadharId ? data.aadharId : 9999999999,
                    address : data.address ? data.address : 'null',
                    photoUrl: data.photoUrl,
                    status : true,
              });


              const checkusername = data.username;
              var now = new Date();
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
                          const jwtData = jwtSignAccessRefreshTokenTenant(t.id,t.user_role.name,t.full_name, user.parent_id)
                          resolve({ status: 200, data: jwtData })
                          return;

                        });
                  }
              })
              .catch(err => {
                  reject({
                      status: 500,
                      message:
                        err.message || "Some error occurred while retrieving tutorials."
                    })
                  return;
                });

          
              return;
              
            }
            const jwtData = jwtSignAccessRefreshTokenTenant(user.id,user.user_role.name,user.full_name, user.parent_id)
            resolve({ status: 200, data: jwtData })
          });

      } catch (error) {
          reject({ status: 500, message: error })
          console.log(error)
      }          
  });
}


module.exports = {
    listTenants,
    saveTenants,
    logInTenants,
    saveSSOTenants
}