import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index";
import User from "../src/models/User";

chai.use(chaiHttp);

describe("Test /api/notifications", () => {
  it("should record requests based on ip of the client", (done) => {
    const clientIp = "192.168.2.1";
    chai
      .request(app)
      .get("/api/notifications")
      .set("X-Forwarded-For", clientIp)
      .end(async (error, response) => {
        const user = await User.findOne({ ip: clientIp });
        expect(user).to.not.be.empty;
        expect(user).to.have.property("requestsMadeInMonth");
        expect(user).to.have.property("maxRequestsPerSec");
        expect(user).to.have.property("maxRequestsPerMonth");
      });
    done();
  });
  it("should return 200 on requests in windowSize", (done) => {
    chai
      .request(app)
      .get("/api/notifications")
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("title");
        expect(response.body).to.have.property("content");
      });
    done();
  });
  it("should return 429 on requests exceeding throttling limits", (done) => {
    const mockRequest = {
      maxRequestsPerSec: 3,
      maxRequestsPerMonth: 10,
      requestsMadeInMonth: true,
    };
    const requestExpectedToFailCount = 5;
    for (let requestCount = 1; requestCount < 5; requestCount++) {
      chai
        .request(app)
        .get("/api/notifications")
        .end((error, response) => {
          if (requestCount === requestExpectedToFailCount) {
            expect(response.body).to.have.property("error");
          }
        });
    }
    done();
  });
  it("should return 429 on requests exceeding monthly limits", (done) => {
    const mockRequest = {
      maxRequestsPerSec: 3,
      maxRequestsPerMonth: 10,
      requestsMadeInMonth: true,
    };
    for (let requestCount = 1; requestCount < 19; requestCount++) {
      chai
        .request(app)
        .get("/api/notifications")
        .end((error, response) => {
          if ((requestCount = mockRequest.maxRequestsPerMonth + 2)) {
            expect(response).to.have.status(429);
            expect(response.body).to.have.property("error");
          }
        });
    }
    done();
  });
});
