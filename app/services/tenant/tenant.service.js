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
  { findOneTenant, saveTenantData, findAllTenants } = require('../../repository/UserRepository');
  var mongoose = require('mongoose');
const { findAllRoomContractByCondition } = require("../../repository/TenantRoomContractRepository");
const { getRolesByName } = require("../../helpers/roles.helper");

const listTenants = async (req, limit, skip, buildingId, searchQuery) => {
  var parentId = req.parentId ? req.parentId : req.userId;

  const roomContractsList = await findAllRoomContractByCondition({ parent_id: parentId, status: true });

  return new Promise((resolve, reject) => {

    let condition = {};
    if (parentId) {
      condition = { parent_id: parentId, status: true , full_name : { $regex : new RegExp(searchQuery, "i") }}
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

          resolve({ status: 200, data: _.map(d, (record) => trasformUserRecord(record, roomContractsList)) })
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

    var expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    var startDate = Date.now();
    if (data.startDateOfMonth && data.startDateOfMonth > 0) {
      startDate = new Date(new Date().setDate(parseInt(data.startDateOfMonth)));
      
      const sDate = new Date(new Date().setDate(parseInt(data.startDateOfMonth)));

      expiryDate = new Date(sDate.setFullYear(sDate.getFullYear() + 1));
      console.log(startDate, " -- ", expiryDate)
    }
    expiryDate.setUTCHours(23, 59, 59, 999);
    const now = Date.now();
    startDate.setUTCHours(0, 0, 0, 0);
    const parentTenantDetails = await findOneTenant(
      {
        _id: parentId,
        start_at: {
          '$lte': now
        },
        end_at: {
          '$gte': now
        }
      });
    if (!parentTenantDetails.data) {
      return ({ status: 404, message: 'Parent Tenant Not Found.' })
    }

    const tenantObject = new tenant(
      {
        parent_id: parentTenantDetails.data._id ? parentTenantDetails.data._id : null,
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

      console.log(tenantObject);
    const checkusername = data.username;

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
      console.log(tenantDetails)
    if (tenantDetails.data) {
      const updateTenantData = {
        parent_id: parentTenantDetails.data._id ? parentTenantDetails.data._id : null,
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
        user_role: role._id
      }
      console.log(updateTenantData, " -- ")
      await updateTenantDetails(null, tenantDetails.data._id, updateTenantData)
      
      if (data.addRoomContract) {
        const resultContract = await saveTenantRoomContract(data, parentId, data.roomId, tenantDetails.data._id);
        return resultContract;
      }
      return ({
        status: 200,
        data: tenantDetails.data,
        message: "Tenant was updated successfully!"
      });
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

const saveParentTenants = async (data, role, parentId) => {
  try {

    var expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    expiryDate.setUTCHours(23, 59, 59, 999);
    var startDate = Date.now();

    const now = Date.now();
    now.setUTCHours(0, 0, 0, 0);

    const tenantObject = new tenant(
      {
        parent_id: null,
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

      console.log(tenantObject);
    const checkusername = data.username;

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
      console.log(tenantDetails)
    if (tenantDetails.data) {
      const updateTenantData = {
        parent_id: null,
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
        user_role: role._id
      }
      console.log(updateTenantData, " -- ")
      await updateTenantDetails(null, tenantDetails.data._id, updateTenantData)
  
      return ({
        status: 200,
        data: tenantDetails.data,
        message: "Tenant was updated successfully!"
      });
    } else {
      const savedTenantData = await saveTenantData(tenantObject);
      
      if (!savedTenantData.data) {
        return ({ status: 500, message: 'Oops ... Something went wrong ....' })
      }
      return ({
        status: 200,
        data: savedTenantData.data,
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

        if (user.user_role.name == 'super_admin') {
          jwtData.isSuperAdmin = true
          jwtData.isAdmin = true
        } else {
          jwtData.isSuperAdmin = false
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

const trasformUserRecord = (record, roomContractsList) => {
  console.log(record);
  var newArray = []
  if (roomContractsList.data) {
    newArray = roomContractsList.data.filter(function (el)
                {
                  return el.tenant_id._id.equals(record._id)
                });
  }

  return {
    _id: record._id,
    name: record.full_name,
    avatar: record.photoUrl,
    mobileNumber: record.mobile_no,
    parentId: record.parent_id,
    address : record.address,
    startAt : record.start_at,
    endAt : record.end_at,
    email : record.email,
    roomId : newArray[0] ? newArray[0].floor_room_id : null,
    buildingId : newArray[0] ? newArray[0].building_id : null,
    buildingFloorId : newArray[0] ? newArray[0].building_floor_id : null,
  }
}

const listParentTenants = async (req, limit, skip, buildingId, searchQuery) => {


    let condition = {};
    const role = await getRolesByName('admin')
    const now = new Date();

    condition = { parent_id: null, status: true, user_role : role._id,
    start_at: {
      '$lte': now
    },
    end_at: {
      '$gte': now
    } }

    console.log(condition);
    const projection = { username : 1, full_name : 1, email : 1, mobile_no :1, address:1, start_at :1 , end_at : 1, created_at: 1, photoUrl : 1 };
    const tenantList = await findAllTenants(condition, projection, limit, skip);
    const data = _.map(tenantList.data, (record) => trasformUserRecord(record, []))
    return data;
}


module.exports = {
  listTenants,
  saveTenants,
  logInTenants,
  saveSSOTenants,
  updateTenantDetails,
  trasformUserRecord,
  saveParentTenants,
  listParentTenants
}