import express from 'express';
import notificationsController from '../controller/Notifications';
import rateLimiter from '../middleware/rateLimiter';

const Router = express.Router();

Router.get('/notifications', rateLimiter, notificationsController.send);

//Admin routes
Router.post('/notifications/renew',notificationsController.renewMonthlySubscription);

export default Router;
