const assert = require("assert");
const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");
const Driver = mongoose.model("driver");

describe("Drivers controller", () => {
  beforeEach((done) => {
    const { drivers } = mongoose.connection.collections;
    drivers
      .drop()
      .then(() => drivers.createIndex({ "geometry.coordinates": "2dsphere" }))
      .then(() => done())
      .catch(() => done());
  });

  it("Post to /api/drivers creates a new driver", (done) => {
    Driver.countDocuments().then((count) => {
      request(app)
        .post("/api/drivers")
        .send({ email: "test@test.com" })
        .end(() => {
          Driver.countDocuments()
            .then((newCount) => {
              assert(count + 1 === newCount);
            })
            .catch((err) => console.log(err));
        });
    });
    done();
  });

  it("PUT to /api/drivers/id edits an existing driver", (done) => {
    const driver = new Driver({ email: "t@t.com", driving: false });
    driver.save().then(() => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end(() => {
          Driver.findOne({ email: "t@t.com" }).then((driver) => {
            console.log(driver);
            assert(driver.driving === true);
            done();
          });
        });
    });
  });

  it("DELETE to /api/drivers/id removes an existing driver", (done) => {
    const driver = new Driver({
      email: "toBeRemoved@test.com",
      driving: false,
    });
    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .send({ deleted: driver.id })
        .end(() => {
          Driver.findById({ _id: driver.id }).then((driver) => {
            assert(!driver);
            done();
          });
        });
    });
  });

  it("GET to /api/drivers finds a drivers within reach", (done) => {
    const seattleDriver = new Driver({
      email: "seattle@test.com",
      geometry: { type: "Point", coordinates: [-122.234626, 47.6543012] },
    });

    const miamiDriver = new Driver({
      email: "miami@test.com",
      geometry: { type: "Point", coordinates: [-80.253, 25.791] },
    });

    Promise.all([seattleDriver.save(), miamiDriver.save()]).then(() => {
      request(app)
        .get("/api/drivers?lng=-80&lat=25")
        .end((err, response) => {
          //console.log(response);
          assert(response.body.length === 1);
          assert(response.body[0].email === "miami@test.com");
          done();
        });
    });
  });
});
