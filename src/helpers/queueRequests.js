import amqp from 'amqplib/callback_api';

const queueRequests = (requestsToBeQueued) => {
  amqp.connect('amqp://localhost', async (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      const queue = 'requestsOnQueue';
      const pendingRequests = JSON.stringify(requestsToBeQueued);
      channel.assertQueue(queue, {
        durable: true,
      });
      channel.sendToQueue(queue, Buffer.from(pendingRequests), { persistent: true });
    });
  });
};

export default queueRequests;
