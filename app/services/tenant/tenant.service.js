const errorCode = require("../../common/errorCode");
const { saveTenantRoomContract } = require("./room.service");
const { transformTenantDetails} = require('../../TransformResponse/transform.tenant');

const db = require("../../models"),
  Role = db.role,
  tenant = db.tenant.tenantModel,
  tenantRoomContract = db.tenant.tenantRoomContract,
  bcrypt = require("bcrypt"),
  Promise = require('bluebird'),
  _ = require('lodash'),
  { jwtSignAccessRefreshTokenTenant } = require('../../helpers/jwt_helpers'),
  { findOneTenant, saveTenantData } = require('../../repository/UserRepository');


const listTenants = async (req, limit, skip, buildingId) => {

  return new Promise((resolve, reject) => {
    var parentId = req.parentId ? req.parentId : req.userId;

    let condition = {};
    if (parentId) {
      condition = { parent_id: parentId, status: true }
    } else {
      condition = { status: true }
    }
    console.log(condition);

    if (buildingId) {

      tenantRoomContract.find({ parent_id: parentId, building_id: buildingId, status: true })
        .populate({ path: 'tenant_id', select: ['username', 'full_name', 'email', 'mobile_no', 'address', 'start_at', 'end_at', 'created_at'] })
        .limit(limit).skip(skip).sort({ updated_at: -1 })
        .then(d => {
          resolve({ status: 200, data: d })
        })
        .catch(err => {
          reject({
            status: 500,
            message:
              err.message || "Some error occurred while retrieving data."
          })
        });

    } else {
      tenant.find(condition)
        .limit(limit).skip(skip).sort({ updated_at: -1 })
        .then(d => {

          resolve({ status: 200, data: _.map(d, (record) => trasformUserRecord(record)) })
        })
        .catch(err => {
          reject({
            status: 500,
            message:
              err.message || "Some error occurred while retrieving data."
          })
        });
    }
  })
}

const saveTenants = async (data, role, parentId) => {
  try {

    const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    console.log(expiryDate, "--")
    var startDate = Date.now();
    if (data.startDateOfMonth && data.startDateOfMonth > 0) {
      startDate = new Date(new Date().setDate(parseInt(data.startDateOfMonth)));
    }


    const tenantObject = new tenant(
      {
        parent_id: parentId ? parentId : null,
        full_name: data.fullName ? data.fullName : '',
        password: bcrypt.hashSync(data.password, 8),
        user_role: role._id,
        username: data.username,
        email: data.email,
        mobile_no: data.mobileNo,
        aadhar_id: data.aadharId,
        address: data.address,
        end_at: expiryDate,
        start_at : startDate,
        status: true,
      })


    const checkusername = data.username;
    const now = Date.now();
    const tenantDetails = await findOneTenant(
      {
        username: checkusername,
        start_at: {
          '$lte': now
        },
        end_at: {
          '$gte': now
        }
      });
    if (tenantDetails.data) {
      if (data.addRoomContract) {
        const resultContract = await saveTenantRoomContract(data, parentId, data.roomId, tenantDetails.data._id)
        
        return ({ status: 200, data : transformTenantDetails(tenantDetails.data)});
      }
    } else {
      const savedTenantData = await saveTenantData(tenantObject);
      
      if (!savedTenantData.data) {
        return ({ status: 500, message: 'Oops ... Something went wrong ....' })
      } else {
        if (data.addRoomContract) {
          const resultContract = await saveTenantRoomContract(data, parentId, data.roomId, savedTenantData.data._id)

          return resultContract;
        }
      }
      return ({
        status: 200,
        data: t,
        message: "Tenant was registered successfully!"
      });

    }

  } catch (error) {
    console.log(error)
    return ({ status: 500, message: error })
  }
}

const logInTenants = async (req, res, username, password) => {

  return new Promise((resolve, reject) => {


    req.app.get('log').info(_.assign(req.app.get('logEntry'), {
      'status': res.api.status
    }));

    var now = new Date();

    // const use = loginTenant(data.username);

    tenant.findOne({
      username: username,
      start_at: {
        '$lte': now
      },
      end_at: {
        '$gte': now
      },
      status: true
    }).populate({ path: 'user_role', select: ['name'] })
      .exec((err, user) => {
        if (err) {
          reject({ status: 500, message: err });
        }
        if (!user || user == null) {

          req.app.get('log').warn(_.assign(req.app.get('logEntry'), {
            'status': res.api.status, message: "User Not found."
          }));
          res.api.status = 404;
          res.api.errors.code = errorCode.NOT_FOUND;
          res.api.errors.message = 'User Not found.';
          resolve(res.api);
          return;
        }
        var pass = password

        pass = pass.replace(/^"|"$/g, '');
        var passwordIsValid = bcrypt.compareSync(
          pass,
          user.password
        );
        if (!passwordIsValid) {
          req.app.get('log').warn(_.assign(req.app.get('logEntry'), {
            'status': res.api.status, message: "Invalid Password!"
          }));
          res.api.status = 404;
          res.api.errors.code = errorCode.NOT_FOUND;
          res.api.errors.message = 'Invalid Password!';
          resolve(res.api);
        }
        const jwtData = jwtSignAccessRefreshTokenTenant(user.id, user.user_role.name, user.full_name, user.parent_id)
        if (user.user_role.name == 'admin') {
          jwtData.isAdmin = true
        } else {
          jwtData.isAdmin = false
        }
        resolve({ status: 200, data: jwtData })
      });
  });
}


const saveSSOTenants = async (data, role, parentId) => {

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
                parent_id: parentId ? parentId : null,
                full_name: data.fullName ? data.fullName : '',
                password: '',
                user_role: role._id,
                username: data.username,
                email: data.email,
                mobile_no: data.mobileNo ? data.mobileNo : 9999999999,
                aadhar_id: data.aadharId ? data.aadharId : 9999999999,
                address: data.address ? data.address : 'null',
                photoUrl: data.photoUrl,
                status: true,
              });


            const checkusername = data.username;
            var now = new Date();
            tenant.findOne({ username: checkusername })
              .then(existingTenant => {
                if (existingTenant) {
                  reject({ status: 404, message: 'Tenant already exists' })

                } else {
                  tenantObject.save((err, t) => {
                    if (err) {
                      reject({ status: 500, message: err })
                      return;
                    }
                    const jwtData = jwtSignAccessRefreshTokenTenant(t.id, t.user_role.name, t.full_name, user.parent_id)
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
          const jwtData = jwtSignAccessRefreshTokenTenant(user.id, user.user_role.name, user.full_name, user.parent_id)
          resolve({ status: 200, data: jwtData })
        });

    } catch (error) {
      reject({ status: 500, message: error })
      console.log(error)
    }
  });
}


const updateTenantDetails = async (req, tenantId, data) => {

  return new Promise((resolve, reject) => {

    tenant.findByIdAndUpdate(tenantId, data, { useFindAndModify: false })
      .then(res => {
        resolve({
          status: 200,
          data: res,
          message: "updated successfully!"
        });
      })
      .catch(err => {
        console.log(err, "err")
        reject({ status: 500, message: err })

      });

  })
}

const trasformUserRecord = (record) => {

  return {
    _id: record._id,
    name: record.full_name,
    avatar: record.photoUrl,
    mobileNumber: record.mobile_no,
    parentId: record.parent_id
  }
}


module.exports = {
  listTenants,
  saveTenants,
  logInTenants,
  saveSSOTenants,
  updateTenantDetails,
  trasformUserRecord
}