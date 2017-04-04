
const MailFarm = require("./mail-farm.js");
const util = require("./util.js");

class MailFarmer {
  constructor(account) {
    this.mailFarms = [];
    this.account = account;
  }

  load(params) {
    const password = util.decrypt(params.password);
    const farm = new MailFarm();

    farm.setImapConnection(params.imap, params.port, params.tls);
    farm.setEmail(params.username, password);
    farm.setAccount(this.account);

    this.mailFarms.push(farm);
  }

  harvest() {
    for(let i = 0; i < this.mailFarms.length; i++) {
      this.mailFarms[i].connect();
    }
  }
}

module.exports = MailFarmer;
