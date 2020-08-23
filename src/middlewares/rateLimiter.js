/* eslint-disable max-len */
import moment from 'moment';
import redis from 'redis';
import addToQueue from '../helpers/queueRequests';

const WINDOW_SIZE_IN_MILLISECOND = 1000;
const MAX_REQUESTS_PER_WINDOW_SIZE = 3;
const WINDOW_LOG_INTERVAL_IN_MILLISECOND = 500;

let pendingRequests;
const redisClient = redis.createClient();

const createRedisRecord = (request) => {
  const newRecord = [];
  const requestLog = {
    requestTimeStamp: moment().unix(),
    requestCount: 1,
  };
  newRecord.push(requestLog);
  redisClient.set(request.ip, JSON.stringify(newRecord));
};
const getRequestsWithinWindow = (record) => {
  const windowStartTimeStamp = moment()
    .subtract(WINDOW_SIZE_IN_MILLISECOND, 'milliseconds')
    .unix();
  const requestsWithinWindow = record.filter(
    (request) => request.requestTimeStamp > windowStartTimeStamp,
  );
  return requestsWithinWindow;
};
const getRequestsOutsideWindow = (record) => {
  const windowStartTimeStamp = moment()
    .subtract(WINDOW_SIZE_IN_MILLISECOND, 'milliseconds')
    .unix();
  const requestsToBeQueued = record.filter(
    (request) => !(request.requestTimeStamp > windowStartTimeStamp),
  );
  return requestsToBeQueued;
};

const getNumberOfRequestsMadeWithinWindowSize = (requestsWithinWindow) => {
  const totalRequests = requestsWithinWindow.reduce(
    (accumulator, request) => accumulator + request.requestCount,
    0,
  );
  return totalRequests;
};

const rateLimiter = (req, res, next) => {
  try {
    if (!redisClient) throw new Error('Redis client not found.');
    redisClient.get(req.ip, (error, record) => {
      if (error) throw error;
      else if (!record) {
        createRedisRecord(req);
        next();
      } else {
        const parsedRecord = JSON.parse(record);
        const requestsWithinWindow = getRequestsWithinWindow(parsedRecord);
        pendingRequests = getRequestsOutsideWindow(parsedRecord);

        const requestsWithinWindowSizeCount = getNumberOfRequestsMadeWithinWindowSize(requestsWithinWindow);

        // handle requests that bleached the limits
        if (requestsWithinWindowSizeCount >= MAX_REQUESTS_PER_WINDOW_SIZE) {
          addToQueue(pendingRequests);
          return res.status(429).send({
            error: `You have exceeded the allowed ${MAX_REQUESTS_PER_WINDOW_SIZE} requests per second. Upgrade for more requests/sec`,
          });
        }

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
          lastRequestLog.requestCount += 1;
          parsedRecord[parsedRecord.length - 1] = lastRequestLog;
        } else {
          //  add request to record
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
