
const bodyParser = require("body-parser");
const express = require("express");
const colors = require('colors');
const cors = require('cors');

const MailService = require("./mail-service.js");
const logger = require("./mail-logger.js");
const util = require("./mail-util.js");
const app = express();

const port = () => Number(process.argv.slice(-1)[0]);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const html = `
  <html>
    <body>
      <h1>Server online</h1>
    </body>
  </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.write(html);
  res.end();
});

const server = app.listen(port(), () => {
  const mailService = new MailService();
  mailService.setup(true, false);
  mailService.start(app);
});
