const errorCode = require('../common/errorCode')

const validateRequestBody = (body) => {
    let errors = [];
    
    if (!body) {
        const error = {
            code: 'INVALID_REQUEST',
            message: 'Invlida Request !'
          }
          errors.push({
            'code'   : errorCode.NULL_VALUE,
            'target' : 'body',
            'message': 'body is required'
        });
    }

    if(!body.username) {
        errors.push({
            'code'   : errorCode.BAD_REQUEST,
            'target' : 'username',
            'message': 'username field is empty'
        });
    }

    if (!body.email) {
        
        errors.push({
            'code'   : errorCode.BAD_REQUEST,
            'target' : 'email',
            'message': 'email field is empty'
        }); 
    }

    if (!body.password) {
        errors.push({
            'code'   : errorCode.BAD_REQUEST,
            'target' : 'password',
            'message': 'password field is empty'
        }); 
    }
    return errors;

}

const validateRequestBodySignIn = (body) => {

    let errors = [];

    if (!body) {
        const error = {
            code: 'INVALID_REQUEST',
            message: 'Invlida Request !'
          }
          errors.push({
            'code'   : errorCode.NULL_VALUE,
            'target' : 'body',
            'message': 'body is required'
        });
    }

    if(!body.username) {
        errors.push({
            'code'   : errorCode.BAD_REQUEST,
            'target' : 'username',
            'message': 'username field is empty'
        });
    }

    if (!body.password) {
        errors.push({
            'code'   : errorCode.BAD_REQUEST,
            'target' : 'password',
            'message': 'password field is empty'
        }); 
    }
    return errors;


}

module.exports = {
    validateRequestBody,
    validateRequestBodySignIn
}