const assert = require("assert");
const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");
const Driver = mongoose.model("driver");

describe("Drivers controller", () => {
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

  xit("PUT to /api/drivers/id edits an existing driver", (done) => {
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
});
