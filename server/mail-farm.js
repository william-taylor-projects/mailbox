
const MailLogger = require("./mail-logger.js").MailLogger;
const MailParser = require('mailparser').MailParser;
const htmlToText = require('html-to-text');
const inspect = require('util').inspect;
const util = require('./util.js');
const aws = require("aws-sdk");
const Imap = require("imap");
const fs = require('fs');

aws.config.update(util.getConfig());

const dynamodb = new aws.DynamoDB({ region: "eu-west-1" });

class MailFarm {
  constructor() {
    this.log = new MailLogger();
    this.restartPeriod = 5000;
    this.account = "N/A";
    this.email = "N/A";
    this.psw = "N/A";
    this.first = true;
  }

  replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  setEmail(email, password) {
    this.log.setBinding(email);
    this.email = email;
    this.psw = password;
  }

  setImapConnection(imapAddress, port, tls) {
    this.imapAddress = imapAddress;
    this.port = port;
    this.tls = tls;
  }

  setAccount(account) {
    this.account = account;
  }

  uploadEmail(mail_object) {
    let object = this;
    let mail = {
      priority: mail_object.priority || "normal",
      subject: mail_object.subject || "N/A",
      from: JSON.stringify(mail_object.from[0]),
      text: mail_object.text,
      html: mail_object.html

    }
    
    this.log.print("Putting email: "+ mail.subject.toString());

    let body = mail.html || mail.text;
    let text = "";

    if(body.length == 0) {
      text = "Error parsing email";
    } else {
      text = htmlToText.fromString(body, {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage : true
      });
    }

    let params = {
      TableName: "MailerRecords",
      Item: {
        UserID: { S: this.account },
        Account: { S: this.email },
        Datetime: { N: Date.now().toString() },
        Subject: { S: mail.subject || "N/A" },
        Text: { S: text },
        Priority: { S: mail_object.priority || "normal" },
        From: { S: JSON.stringify(mail_object.from[0]) }
      }
    }

    dynamodb.putItem(params, function(err, data) {
      object.log.print(err || "Success putItem");
    });
  }

  connect() {
    let farm = this;

    this.mailparser = new MailParser();
    this.imapServer = new Imap({
      user: this.email,
      password: this.psw,
      host: this.imapAddress,
      port: this.port,
      tls: this.tls
    });

    this.imapServer.on("error", function(err) {
      farm.log.print('Error on ' + farm.email + ' : ' + err);
      farm.log.print('Restarting Connection ' + farm.email);

      setTimeout(function() {
        farm.imapServer.end();
      }, farm.restartPeriod);
    });

    this.imapServer.on("close", function(msg) {
      farm.log.print("Connection Closing had error = " + msg);
    });

    this.imapServer.on("alert", function(msg) {
      farm.log.print("Alert : " + msg);
    });

    this.imapServer.on("mail", function(num) {
      //farm.log.print("Inbox Length " + num);
      if(!farm.first) {
        farm.log.print("Inbox length  " + farm.box.messages.total);

        let f = farm.imapServer.seq.fetch(farm.box.messages.total + ':*', { bodies: '' });
        f.on('message', function(msg, seqno) {
          let mailParser = new MailParser();
          mailParser.on("end", function(mail_object) {
            //farm.log.print(JSON.stringify(mail_object));
            farm.uploadEmail(mail_object);
          });

          msg.on('body', function(stream, info) {
            stream.pipe(mailParser);
          });
        });
      } else {
        farm.first = false;
      }
    });

    this.imapServer.on("ready", function() {
      farm.imapServer.openBox('INBOX', true, function(err, box) {
        farm.log.print("Connected to " + farm.email);
        farm.box = box;
      });
    });

    this.imapServer.on("close", function() {
      farm.log.print("Disconnected from : " + farm.email);
      farm.first = true;
      farm.box = null;
      farm.imapServer.connect();
    });

    this.imapServer.connect();
  }
}

module.exports = MailFarm;
