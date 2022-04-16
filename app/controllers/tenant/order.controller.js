const errorCode = require('../../common/errorCode');
const {generateToken, initiateRoomTransactionDetails} = require('../../services/tenant/order.service')
exports.createPaytmToken = async (req, res, next) => {

    try {
        const orderData = req.body;
        if(!orderData) {
          res.status(500).send({ message: errorCode.BAD_REQUEST });
        }
        const result = await generateToken(orderData);
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
        res.status(500).send({ message: errorCode.BAD_REQUEST });
      }

      const result = await initiateRoomTransactionDetails(orderData, req.userId);
      console.log(result,"result")
      res.send(result);
    } catch (error) {
      return res.send(error);
    }
}