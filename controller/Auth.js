import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

class Auth {
  static async signup(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res.status(409).send({
          status: 409,
          error: 'Email already exists',
        });
      }
      const newUser = new User({
        email,
        password,
        isAdmin: false,
        allowedRequestsPerSec: process.env.REQUESTS_PER_SECOND_DEFAULT,
        allowedRequestsPerMonth: process.env.REQUESTS_PER_MONTH_DEFAULT,
      });
      newUser.save();
      return res.status(201).send({
        status: 201,
        message: 'Account created.',
      });
    } catch (error) {
      return res.status(422).send({
        status: 422,
        error,
      });
    }
  }

  static login(req, res) {
    req.login(req.body, () => {
      res.status(200).send({
        status: 200,
        message: 'Logged in successfully',
      });
    });
  }

  static logout(req, res) {
    req.logout();
    res.send('logged out!');
  }
}

export default Auth;
