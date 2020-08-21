import express from 'express';
import passport from 'passport';
import notificationsController from '../controller/Notifications';

const Router = express.Router();

Router.post('/notifications', notificationsController.send);

export default Router;
