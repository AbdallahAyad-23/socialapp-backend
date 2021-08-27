const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({ googleId: profile.id }, function (err, user) {
        if (user) {
          return cb(null, user);
        } else {
          const user = new User({
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            googleId: profile.id,
            username: profile.displayName,
          });
          user
            .save()
            .then((user) => {
              return cb(null, user);
            })
            .catch((err) => cb(err));
        }
      });
    }
  )
);
