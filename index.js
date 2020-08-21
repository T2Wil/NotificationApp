import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import usersRoutes from './routes/user';
import notificationRoutes from './routes/notifications';
import passport from './config/passport';
import initializeAdmin from './seeds/admin';
import rateLimiter from './middlewares/rateLimiter';

const PORT = process.env.PORT || 3000;
const app = express();

mongoose
  .connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // require('./seeds/admin')
    initializeAdmin();
    app.use(express.json());

    // enable express session
    app.use(session({
      secret: 'secret',
    }));
    // passport
    app.use(passport.initialize());
    app.use(passport.session());

    // apply requests rate limiter to all requests
    app.use('/api/', rateLimiter);
    app.use('/api', usersRoutes);
    app.use('/api/', notificationRoutes);
    app.use((req, res) => {
      res.status(404).send({
        status: 404,
        error: 'Not found',
      });
    });
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((error) => console.log('error: ', error));
