const crypto = require('crypto'),
        config = require("../config/auth.config"),
        algorithm = config.aesAlgo,
        key = config.aesKey,
        iv = config.aesKey;


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

   
//    (function() {

//     function decrypt(text) {
//         console.log("TEXT ___",text)
//         let iv = Buffer.from(text.iv, 'hex');
//         let encryptedText = Buffer.from(text.encryptedData, 'hex');
//         let decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(key), iv);
//         let decrypted = decipher.update(encryptedText);
//         decrypted = Buffer.concat([decrypted, decipher.final()]);
//         return decrypted.toString();
//     }

    

//     module.exports.decrypt = decrypt;

// })();

const encryptData = (plainText, key, outputEncoding = "base64") => {
    const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
    return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(outputEncoding);
}

const decryptData = () => {
    const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
    return Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
}


//    const aes = {
//        encrypt,decrypt
//    }
//    module.exports = aes;

module.exports = {
    encryptData,
    decryptData
}