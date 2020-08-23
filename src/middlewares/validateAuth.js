const validateAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send({
    status: 401,
    error: 'You need to login.',
  });
};
export default validateAuth;
