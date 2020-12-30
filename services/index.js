const Auth = require("./auth.service");

module.exports = class Service {
  constructor(app) {
    this.app = app;
    this.auth = new Auth(app);
  }
};
