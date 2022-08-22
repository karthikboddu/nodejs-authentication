const db = require("../models");
const Configuration = db.configs;

const getConfigurations = async (res) => {

    try {
        Configuration.find({})
        .then(data => {
            console.log(data);
            res.send(data);
        })
        .catch(err => {
            console.log(err)
        });
        return res
    } catch (error) {
        
    }

}

const getConfigur = async () => {

    try {
        
        Configuration.find({})
        .then(data => {
           return data;
        })
        .catch(err => {
            console.log(err)
        });

    } catch (error) {
        
    }

}

const setConfiguration =  async (res,cname,ckey,cvalue) => {

    try {
        const data = new Configuration({
            name: cname,
            key: ckey,
            value: cvalue,
            type : 'AUTH',
            status : true
        });
        data.save(err => {
            if (err) {
                //console.log(err)
                return res.status(500).send({
                    success: false,
                    message: 'User already exist!'
                });
            }
        });    
    } catch (error) {
        res.status(500).send({ message: error });
    }

}


module.exports = {
    getConfigurations,
    setConfiguration,
    getConfigur
};