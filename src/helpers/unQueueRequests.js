import amqp from 'amqplib/callback_api';

let pendingRequests;
const unQueueRequests = () => {
  amqp.connect('amqp://localhost', (error, connection) => {
    connection.createChannel((error, channel) => {
      const queue = 'requestsOnQueue';

      channel.assertQueue(queue, {
        durable: true,
      });
      channel.prefetch(1);
      channel.consume(queue, (msg) => {
        pendingRequests = JSON.parse(msg.content);
        channel.ack(msg);
      }, {
        noAck: false,
      });
    });
  });
  return pendingRequests;
};

export default unQueueRequests;
