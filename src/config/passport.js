import passport from 'passport';
import passportLocal from 'passport-local';
import User from '../models/User';

const LocalStrategy = passportLocal.Strategy;
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            done(null, false, { message: 'user not found' });
          } else if (user.password === password) {
            done(null, user);
          } else done(null, false, { message: 'wrong password' });
        })
        .catch((error) => done(error));
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
export default passport;
