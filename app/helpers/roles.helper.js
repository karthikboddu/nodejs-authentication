    const Promise   = require('bluebird'),
          db        = require('../models'),
          Role = db.role;


          
const getRolesByName = async (userRole) => {

              return new Promise((resolve, reject) => {
                Role.findOne({ name: userRole })
                    .then(d => {
                        resolve(d)
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


module.exports = {
    getRolesByName
}

          
