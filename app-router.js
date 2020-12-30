const auth = require("./middleware/auth");

module.exports = class AppRouter {
  constructor(app) {
    this.app = app;

    this.setupRouter = this.setupRouter.bind(this);

    this.setupRouter();
  }

  setupRouter() {
    const app = this.app;

    console.log("APp ROuter works!");

    app.post("/api/register", async (req, res) => {
      app.service.auth.registerUser(req, res);
    });

    app.post("/api/login", async (req, res) => {
      app.service.auth.loginUser(req, res);
    });

    app.delete("/api/delete", auth, async (req, res) => {
      app.service.auth.deleteUser(req, res);
    });

    app.post("/api/validToken", async (req, res) => {
      app.service.auth.checkToken(req, res);
    });

    app.get("/api/getUser", async (req, res) => {
      app.service.auth.getUser(req, res);
    });
  }
};
