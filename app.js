const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const app = express();
const { before, beforeEach } = require("mocha");

mongoose.Promise = global.Promise;
if (process.env.NODE_ENV !== "test") {
  mongoose.connect("mongodb://localhost/rapid", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (process.env.NODE_ENV === "test") {
    before((done) => {
      mongoose.connect("mongodb://localhost/rapid_test");
      mongoose.connnection
        .once("open", () => done())
        .on("error", (err) => {
          console.warn("Warning", err);
        });
    });

    beforeEach((done) => {
      const { drivers } = mongoose.connection.collections;
      drivers
        .drop()
        .then(() => done())
        .catch(() => done());
    });
  }
}

app.use(bodyParser.json());
routes(app);

app.use((err, req, res, next) => {
  //console.log(err);
  res.status(422).send({ error: err.message });
});

module.exports = app;
