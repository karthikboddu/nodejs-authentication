const _ = require('lodash');


const transformTenantDetails = (record) => {

    return {
        "_id": record._id,
        "parent_id": "61f64f9af320710016814606",
        "user_role": "630c4d7196e1747b4c294651",
        "full_name": "Kiran Singh ",
        "username": "kiran",
        "email": "kiran@mail.com",
        "mobile_no": 4989492689,
        "aadhar_id": "499594991298",
        "address": "Hyderabad",
        "userType": "INTERNAL",
        "end_at": "2023-10-26T04:46:06.170Z",
        "status": true,
        "start_at": "2022-10-26T04:46:06.207Z",
        "activated_at": "2022-10-26T04:46:06.207Z",
        "last_login_at": "2022-10-26T04:46:06.207Z",
        "created_at": "2022-10-26T04:46:06.207Z",
        "updated_at": "2022-10-26T04:46:06.207Z",
        "createdAt": "2022-10-26T04:46:06.523Z",
        "updatedAt": "2022-10-26T04:46:06.523Z",
        "__v": 0
    }

}

module.exports = {
    transformTenantDetails
}