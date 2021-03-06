const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user');
const { secretKey } = require('../config/config');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
  // issuer: 'accounts.examplesoft.com',
  // audience: 'yoursite.net',
};

module.exports = passport => {
  passport.use('jwt', new JwtStrategy(options, async (payload, done) => {
    const user = await User.findById(payload.userId, 'id email', (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  }));
  passport.use('jwt-admin', new JwtStrategy(options, async (payload, done) => {
    const user = await User.findById(payload.userId, 'id email admin', (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user && user.admin === true) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  }));
  passport.use('jwt-userData', new JwtStrategy(options, async (payload, done) => {

    const user = await User.findById(payload.userId, 'email phone name surname', (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  }));
};

