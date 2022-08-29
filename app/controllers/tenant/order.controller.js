const errorCode = require('../../common/errorCode');
const _           = require('lodash');
const {generateToken, initiateRoomTransactionDetails, updateOrderDetails,
   fetchTenantRoomOrderDetails, fetchRecentAllTenantRoomOrderDetails,
   saveOrderDetailsAndComplete,initiateBulkRoomTransactionDetails} = require('../../services/tenant/order.service')
const { getPagination } = require('../../common/util');


exports.createPaytmToken = async (req, res, next) => {

    try {
     
        const orderData = req.body;
        if(!orderData) {
          res.status(500).send({ message: errorCode.BAD_REQUEST });
        }
        const result = await generateToken(orderData,req.userId);
        console.log(result,"result")
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
}


exports.initRoomPayment = async (req, res, next) => {

  try {
      const orderData = req.body;
      if(!orderData) {
        return res.status(500).send({ message: errorCode.BAD_REQUEST });
      }
      const tenantId = req.query.tenantId ? req.query.tenantId : req.userId;
      if(!tenantId) {
        return res.status(500).send({ message: errorCode.BAD_REQUEST });
      }

      const result = await initiateRoomTransactionDetails(orderData, tenantId);
      res.send(result);
    } catch (error) {
      return res.send(error);
    }
}

exports.bulkInitRoomPayments = async (req, res, next) => {

  try {
      const result = await initiateBulkRoomTransactionDetails(req.userId, req.parentId);
      res.send(result);
    } catch (error) {
      return res.send(error);
    }
}


exports.updateOrderStatus = async (req, res, next) => {

  try {
      const orderData = req.body;
      if(!orderData) {
        res.status(500).send({ message: errorCode.BAD_REQUEST });
      }

      const result = await updateOrderDetails(orderData, req.userId);
      console.log(result,"result")
      res.send(result);
    } catch (error) {
      return res.send(error);
    }
}



exports.tenantRoomOrderDetails = async (req, res, next) => {
  try {
      const status = req.query.paymentStatus ? req.query.paymentStatus : 'P';
      const tenantId = req.query.tenantId ? req.query.tenantId : null;
      let {page, size} = req.query;
      if (!page) {
          page = 1;
      }
      if (!size) {
          size = 10;
      }
      if (tenantId) {
        req.userId = tenantId;
      }

      const limit = parseInt (size);
      const skip = (page - 1) * size;

      const result = await fetchTenantRoomOrderDetails(req.userId, status, limit, skip);
      const totalCount = result.data.orderDetails ? result.data.orderDetails.length : 0;
      const pagination = getPagination(page, size, totalCount);
      result.data._pagination = pagination;
      console.log(totalCount)
      res.send(result);
  } catch (error) {
      return res.send(error);
  }
}

exports.recentAllTenantRoomOrderDetails = async (req, res, next) => {
  try {

      const status = req.query.paymentStatus ? req.query.paymentStatus : 'P';
      const roomId = req.query.roomId ? req.query.roomId : null;
      const roomPaymentId = req.query.roomPaymentId ? req.query.roomPaymentId : null;

      let {page, size, startDate, endDate} = req.query;
      if (!page) {
          page = 1;
      }
      if (!size) {
          size = 100;
      }

      const limit = parseInt (size);
      const skip = (page - 1) * size;

      const result = await fetchRecentAllTenantRoomOrderDetails(req.userId, status, limit, skip, startDate, endDate, roomId, roomPaymentId);
      const totalCount = result ? result.length : 0;

      const pagination = getPagination(page, size, totalCount);
      res.api.data = {
        orderDetails: result,
        _pagination : pagination
      };
      req.app.get('log').info(_.assign(req.app.get('logEntry'), {
        'status': res.api.status
      }));

      res.send(res.api);
  } catch (error) {
      return res.send(error);
  }
}


exports.createOrderAndComplete = async( req, res, next) => {
  try {
    const orderData = req.body;
    if(!orderData) {
      res.status(500).send({ message: errorCode.BAD_REQUEST });
    }

    const result = await saveOrderDetailsAndComplete(orderData, req.userId);
    
    res.send(result);
  } catch (error) {
    console.log(error,"result")
    return next(error);
  }

}

