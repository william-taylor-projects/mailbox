const crypto = require('crypto');
const fs = require('fs');
const util = {
  LAST_ARG: process.argv.length - 2,
  FIRST_ARG: 0,

  decrypt: function(text, keyArg) {
    const key = keyArg || util.getCmdArg(util.LAST_ARG);
    const decipher = crypto.createDecipher('aes-256-ctr', key)
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  },

  getConfig: function() {
    const file = fs.readFileSync("./credentials.json", 'utf8');
    const obj = JSON.parse(file.replace(/^\uFEFF/, ''));

    return {
      accessKeyId: util.decrypt(obj.AKI),
      secretAccessKey: util.decrypt(obj.SAK),
      region: util.decrypt(obj.REG)
    };
  },

  getCmdArg: function(num) {
    if(num < process.argv.length) {
      return process.argv[num];
    } else {
      return null;
    }
  }
};

module.exports = util;
