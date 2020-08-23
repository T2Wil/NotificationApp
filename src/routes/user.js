import express from 'express';
import passport from 'passport';
import authController from '../controller/Auth';
import validateAuth from '../middlewares/validateAuth';

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', passport.authenticate('local'), authController.login);

Router.get('/logout', authController.logout);

Router.get(
  '/dashboard',
  validateAuth,
  (req, res) => {
    res.send('Inside dashboard');
  },
);
export default Router;
