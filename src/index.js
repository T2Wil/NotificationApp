import express from 'express';
import mongoose from 'mongoose';
import notificationRoutes from './routes/notifications';

const PORT = process.env.PORT || 3000;
const app = express();

mongoose
  .connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.use(express.json());
    app.use('/api/', notificationRoutes);
    app.use((req, res) => res.status(404).send({
      status: 404,
      error: 'Not found',
    }));
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((error) => console.log('error: ', error));

export default app;