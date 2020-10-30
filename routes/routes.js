const driverController = require("../controllers/driverController");

module.exports = (app) => {
  app.get("/api", driverController.greeting);
};
