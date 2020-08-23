import User from '../models/User';

export const getRequestsMadeInMonth = async (requestIp) => {
  const user = await User.findOne({ ip: requestIp });
  return user.requestsMadeInMonth;
};
export const getAllowedRequestsInMonth = async (requestIp) => {
  const user = await User.findOne({ ip: requestIp });
  return user.maxRequestsPerMonth;
};

export const getMaxRequestsPerSec = async (requestIp) => {
  const user = await User.findOne({ ip: requestIp });
  if(user) return user.maxRequestsPerSec;
  else return null;
}
export const getMaxRequestsPerMonth = async (requestIp) => {
  const user = await User.findOne({ ip: requestIp });
  if(user) return user.maxRequestsPerMonth;
  else return null;
}