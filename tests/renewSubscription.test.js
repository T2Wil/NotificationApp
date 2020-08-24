import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index";
import dotenv from "dotenv";
import {
  getMaxRequestsPerMonth,
  getMaxRequestsPerSec,
  getAllowedRequestsInMonth,
} from "../src/database/user";

dotenv.config();

chai.use(chaiHttp);

describe("Test /api/notifications/renew", () => {
    it("should record requests based on ip of the client", (done) => {
        const clientIp = '192.168.2.1';
      chai
      .request(app)
      .get("/api/notifications")
      .set('X-Forwarded-For', clientIp)
      .end(async(error, response) => {
          const user = await User.findOne({ip: clientIp})
          expect(user).to.not.be.empty;
          expect(user).to.have.property('requestsMadeInMonth');
          expect(user).to.have.property('maxRequestsPerSec');
          expect(user).to.have.property('maxRequestsPerMonth');
        });
        done();
    })
  it("should renew subscription with default values if no req.body", (done) => {
    chai
      .request(app)
      .post("/api/notifications/renew")
      .end(async (error, response) => {
        expect(response.body.user)
          .to.have.property("maxRequestsPerSec")
          .that.equals(parseInt(process.env.REQUESTS_ALLOWED_PER_SEC));
        expect(response.body.user)
          .to.have.property("maxRequestsPerMonth")
          .that.equals(parseInt(process.env.REQUESTS_ALLOWED_PER_MONTH));
        expect(response.body.user).to.have.property("requestsMadeInMonth");
    });
    done();
  });
  it("should renew subscription with the given data", (done) => {
    const clientIp = "192.168.2.1";
    chai
      .request(app)
      .post("/api/notifications/renew")
      .set("X-Forwarded-For", clientIp)
      .send({
        maxRequestsPerSec: 3,
        maxRequestsPerMonth: 10,
        requestsMadeInMonth: true,
      })
      .end(async (error, response) => {
        expect(response.body.user)
          .to.have.property("maxRequestsPerSec")
          .that.equals(await getMaxRequestsPerSec(clientIp));
        expect(response.body.user)
          .to.have.property("maxRequestsPerMonth")
          .that.equals(await getMaxRequestsPerMonth(clientIp));
        expect(response.body.user)
          .to.have.property("requestsMadeInMonth")
          .that.equals(await getAllowedRequestsInMonth(clientIp));
        });
        done();
  });
});
