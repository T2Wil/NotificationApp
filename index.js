import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import usersRoutes from './routes/user';
import passport from './config/passport';
import initializeAdmin from './seeds/admin';

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

    app.use('/api', usersRoutes);
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
