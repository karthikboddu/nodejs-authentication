const errorCode = require('../../common/errorCode');
const {generateToken} = require('../../services/tenant/order.service')
exports.createPaytmToken = async (req, res, next) => {

    try {
        const orderData = req.body;
        const result = await generateToken(orderData);
        console.log(result,"result")
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
}