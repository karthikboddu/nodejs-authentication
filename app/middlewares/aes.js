const crypto = require('crypto');
const config = require("../config/auth.config");
const algorithm = 'aes-256-ecb';
const key = config.aesKey;
const iv = config.aesKey;


//    encrypt = (text) => {
//     let cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), iv);
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
//    }
   

//    decrypt = (text) =>{
//        console.log("TEXT ___",text)
//     let iv = Buffer.from(text.iv, 'hex');
//     let encryptedText = Buffer.from(text.encryptedData, 'hex');
//     let decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(key), iv);
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
//    }
   
   (function() {

    function decrypt(text) {
        console.log("TEXT ___",text)
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    

    module.exports.decrypt = decrypt;

})();




//    const aes = {
//        encrypt,decrypt
//    }
//    module.exports = aes;