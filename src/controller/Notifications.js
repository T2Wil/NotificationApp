import dotenv from 'dotenv';
// import kafka from '../config/kafka';

dotenv.config();
// create a producer from the kafka instance to produce a message on a topic

class Notifications {
  static async send(req, res) {
    try {
      res.status(200).send({
        status: 200,
        title: 'important communication',
        content: 'Urgent meeting on Friday',
      });
    } catch (error) {
      res.send({ error });
    }
  }
}
export default Notifications;
