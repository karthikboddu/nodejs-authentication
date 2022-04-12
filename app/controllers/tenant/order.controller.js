const errorCode = require('../../common/errorCode');
const {generateToken} = require('../../services/tenant/order.service')
exports.createPaytmToken = async (req, res, next) => {

    try {
        const result = await generateToken(res);
        console.log(result,"result")
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
}