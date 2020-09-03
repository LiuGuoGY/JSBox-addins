const CryptoJS = require('scripts/crypto-js');
    
const key = CryptoJS.enc.Utf8.parse("LAUNCHCENTERBYLG");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('LAUNCHCENTERBYLG');   //十六位十六进制数作为密钥偏移量

//解密方法
function decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

//加密方法
function encrypt(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
}