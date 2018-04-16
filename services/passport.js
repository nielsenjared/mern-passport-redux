const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubClientID,
      clientSecret: keys.githubClientSecret,
      callbackURL: keys.githubCallbackURL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ githubId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({ githubId: profile.id }).save();
      done(null, user);
    }
    // (accessToken, refreshToken, profile, done) => {
    //   User.findOne({ githubId: profile.id }).then(existingUser => {
    //     if (existingUser) {
    //       done(null, existingUser);
    //     } else {
    //       new User({ githubId: profile.id })
    //         .save()
    //         .then(user => done(null, user));
    //     }
    //   });
    // }
  )
);
