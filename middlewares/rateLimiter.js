import moment from 'moment';
import redis from 'redis';

const WINDOW_SIZE_IN_MILLISECOND = 1000;
const MAX_REQUESTS_PER_WINDOW_SIZE = 3;
const WINDOW_LOG_INTERVAL_IN_MILLISECOND = 500;

const rateLimiter = (req, res, next) => {
  try {
    // initialize redis client
    const redisClient = redis.createClient();
    if (!redisClient) throw 'Redis client not found.';

    // get redis saved data(record) per request.ip
    redisClient.get(req.ip, (error, record) => {
      if (error) throw error;
      // if no existing record in a window size then create one in redis memory
      else if (!record) {
        const newRecord = [];
        const requestLog = {
          requestTimeStamp: moment().unix(),
          requestCount: 1,
        };
        newRecord.push(requestLog);
        redisClient.set(req.ip, JSON.stringify(newRecord));
        next();
      } else {
        // calculate requests made in the current window
        const parsedRecord = JSON.parse(record);
        console.log('record: ', record);
        console.log('parsedRecord: ', parsedRecord);
        const windowStartTimeStamp = moment()
          .subtract(WINDOW_SIZE_IN_MILLISECOND, 'milliseconds')
          .unix();
        const requestsWithinWindow = parsedRecord.filter(
          (request) => request.requestTimeStamp > windowStartTimeStamp,
        );
        console.log('requestsWithinWindow', requestsWithinWindow);
        const totalWindowRequestsCount = requestsWithinWindow.reduce(
          (accumulator, request) => accumulator + request.requestCount,
          0,
        );

        console.log('Above handle requests that bleached the limits : ', totalWindowRequestsCount);
        console.log('totalWindowRequestsCount >= MAX_REQUESTS_PER_WINDOW_SIZE : ', totalWindowRequestsCount >= MAX_REQUESTS_PER_WINDOW_SIZE);
        // handle requests that bleached the limits
        if (totalWindowRequestsCount >= MAX_REQUESTS_PER_WINDOW_SIZE) {
          //=>add to queue
          return res.status(429).send({
            error: `You have exceeded the allowed ${MAX_REQUESTS_PER_WINDOW_SIZE} requests per second. You might be charged for the exceeded ones.`,
          });
        }
        //=>check if there are some messages in queue (add them in the parsedRecord)


        // Check whether each request is in the current window size
        const lastRequestLog = parsedRecord[parsedRecord.length - 1];
        const currentWindowIntervalStartTimeStamp = moment()
          .subtract(WINDOW_LOG_INTERVAL_IN_MILLISECOND, 'milliseconds')
          .unix();

        // if we still in the window size increment the counter

        if (
          lastRequestLog.requestTimeStamp
            > currentWindowIntervalStartTimeStamp
        ) {
          lastRequestLog.requestCount++;
          parsedRecord[parsedRecord.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          parsedRecord.push({
            requestTimeStamp: moment().unix(),
            requestCount: 1,
          });
        }
        redisClient.set(req.ip, JSON.stringify(parsedRecord));
        next();
      }
    });
  } catch (error) {
    res.send({ error });
  }
};
export default rateLimiter;
