
const bodyParser = require("body-parser");
const express = require("express");
const colors = require('colors');
const cors = require('cors');

const MailService = require("./mail-service.js");
const logger = require("./mail-logger.js");
const util = require("./util.js");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => res.json({ "msg":"service is running" }));

const getOptions = () => {
  const args = util.getCmdArg(util.LAST_ARG - 1).toLowerCase();

  if(args == "both") {
    return { api: true, farmers: true};
  } else if(args == "api") {
    return { api: true, farmers: false};
  } else if(args == "farm") {
    return { api: false, farmers: true};
  } else {
    return { api: false, farmers: false };
  }
};

const port = () => Number(process.argv.slice(-1)[0]);

const server = app.listen(port(), () => {
  console.log("Server is now online");

  const mailService = new MailService();
  const options = getOptions();

  console.log('Got options setting up mail service');

  mailService.setup(options.api, options.farmers);
  mailService.start(app);
});
