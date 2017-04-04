
const bindings = [];
const colours = [
  "red", "green", "yellow",
  "blue", "magenta", "cyan",
  "white", "gray"
];

let instances = -1;

class MailLogger {
  constructor() {
    if(instances + 1 > colours.length) {
      throw "Error reached log count limit!";
    }

    this.colour = colours[++instances];
    this.ID = instances;
  }

  setBinding(account) {
    bindings.push({ account: account, ID: this.ID });
  }

  print(log) {
    const message = "Cluster " + this.ID + " : " + log;
    console.log(message[this.colour]);
  }
}


module.exports.printBindings = () => {
  console.log("\n - Logger Bindings \n".gray);
  for(let i = 0; i < bindings.length; i++) {
    console.log(bindings[i].ID + " -> " + bindings[i].account.gray);
  }

  console.log("\n---------------------\n".gray);
}

module.exports.MailLogger = MailLogger;
