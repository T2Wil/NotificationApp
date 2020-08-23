import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

class Notifications {
  static async send(req, res) {
    try {
      let user = await User.findOne({ ip: req.ip });
      if (!user) {
        user = new User({
          ip: req.ip,
          requestsMadeInMonth: req.requestsWithinWindowSizeCount || 1,
          maxRequestsPerSec: process.env.REQUESTS_ALLOWED_PER_SEC,
          maxRequestsPerMonth: process.env.REQUESTS_ALLOWED_PER_MONTH,
        });
        user.save();
      } else {
        const monthlyNotificationRequests =
          user.requestsMadeInMonth + req.requestsWithinWindowSizeCount;
        user.requestsMadeInMonth = monthlyNotificationRequests;
        await user.save();
      }
      return res.status(200).send({
        status: 200,
        title: "important communication",
        content: "Urgent meeting on Friday",
        subscription: {
          maxRequestsPerSec: user.maxRequestsPerSec,
          maxRequestsPerMonth: user.maxRequestsPerMonth,
        },
      });
    } catch (error) {
      return res.send({ error });
    }
  }
  static async renewMonthlySubscription(req, res) {
    try {
      const { maxRequestsPerSec, maxRequestsPerMonth, requestsMadeInMonth } = req.body;
      let user;
      user = await User.findOne({ ip: req.ip });

      if (!user) {
        user = new User({
          ip: req.ip,
          requestsMadeInMonth: req.requestsWithinWindowSizeCount || 1,
          maxRequestsPerSec:
            maxRequestsPerSec || process.env.REQUESTS_ALLOWED_PER_SEC,
          maxRequestsPerMonth:
            maxRequestsPerMonth || process.env.REQUESTS_ALLOWED_PER_MONTH,
        });
        user.save();
      } else {
        user.requestsMadeInMonth = requestsMadeInMonth ? 0 : user.requestsMadeInMonth;
        user.maxRequestsPerSec =
          maxRequestsPerSec || process.env.REQUESTS_ALLOWED_PER_SEC;
        user.maxRequestsPerMonth =
          maxRequestsPerMonth || process.env.REQUESTS_ALLOWED_PER_MONTH;
        user.save();
      }
      return res.status(200).send({
        status: 200,
        message: "Renewed with success.",
        user : {
          maxRequestsPerSec: user.maxRequestsPerSec,
          maxRequestsPerMonth: user.maxRequestsPerMonth,
          requestsMadeInMonth: user.requestsMadeInMonth,
        },
      });
    } catch (error) {
      return res.send({ error });
    }
  }
  static async upgrade(req, res) {}
}
export default Notifications;
