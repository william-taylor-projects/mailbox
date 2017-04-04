
const mailLogger = require("./mail-logger.js");
const MailFarmer = require("./mail-farmer.js");
const express = require("express");
const util = require("./util.js");
const aws = require("aws-sdk");

aws.config.update(util.getConfig());

const dynamodb = new aws.DynamoDB({ region: "eu-west-1" });

class MailService {
  constructor() {
    this.enableFarmers = false;
    this.enableAPI = false;
    this.router = express.Router();
  }

  setup(enabledAPI, enabledFarmers) {
    this.enableFarmers = enabledFarmers;
    this.enableAPI = enabledAPI;

    if(enabledFarmers) {
      const params = {
        TableName: "MailerUsers",
        AttributesToGet: ["Username", "Account"]
      };

      dynamodb.scan(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log('Got mail users', data.Items.length);

          for(let i = 0; i < data.Items.length; i++) {
            const username = data.Items[i].Username.S;
            const accountParams = {
              TableName: "MailerAccount",
              ScanFilter: {
                UserID: {
                  ComparisonOperator: 'EQ',
                  AttributeValueList: [{ S: username }]
                }
              },
              AttributesToGet: ["Account", "Password", "Imap", "Port", "Tls"]
            };

            dynamodb.scan(accountParams, function (err, data) {
              if(err)  {
                console.log(JSON.stringify(err), data);
              } else {
                const farmer = new MailFarmer(username);
                for(let x = 0; x < data.Items.length; x++) {
                  const emailFarm = {
                    username: data.Items[x].Account.S,
                    password: data.Items[x].Password.S,
                    imap: data.Items[x].Imap.S,
                    port: data.Items[x].Port.N,
                    tls: data.Items[x].Tls.BOOL
                  };

                  farmer.load(emailFarm);
                }

                mailLogger.printBindings();
                farmer.harvest();
              }
            });
          }
        }
      });
    } else {
      console.log('Farmers disabled skipping mail farm setup');
    }
  }

  start(root) {
    if(this.enableAPI) {
      this.router.post("/deleteEmail/", function(req, res) {
        const accountID = req.body.accountID;
        const dateID = req.body.dateID;

        if(accountID && dateID) {
          const deleteObject = {
            TableName: "MailerRecords",
            Key: {
              UserID: { S: accountID },
              Datetime: { N: dateID }
            }
          };

          dynamodb.deleteItem(deleteObject, function(err, data) {
            if(err) {
              res.json({ "msg": "Error deleting item" });
            } else {
              res.json({ "msg": "Delete item success" });
            }
          });
        } else {
          res.json({ "msg": "Email deleted from database." });
        }
      })

      this.router.post("/getEmails/", function(req, res) {
        let queryParams = {};
        if(!req.body.email) {
          queryParams = {
            TableName: "MailerRecords",
            KeyConditions: {
              UserID: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                  S: "wi11berto@yahoo.co.uk"
                }]
              },
              Datetime: {
                ComparisonOperator: 'GE',
                AttributeValueList: [{
                  N: '0'
                }]
              }
            },

            ScanIndexForward:false,
            Limit: 25
          };
        } else {
          queryParams = {
            TableName: "MailerRecords",
            KeyConditions: {
              UserID: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                  S: "wi11berto@yahoo.co.uk"
                }]
              },
              Datetime: {
                ComparisonOperator: 'GE',
                AttributeValueList: [{
                  N: '0'
                }]
              }
            },

            QueryFilter: {
              Account: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                  S: req.body.email
                }]
              }
            },

            ScanIndexForward: false,
            Limit: 25
          };
        }

        dynamodb.query(queryParams, function(err, data) {
          res.json({ "emails":data, "err": err });
        });
      });

      root.use('/', this.router);
    }
  }
}

module.exports = MailService;
