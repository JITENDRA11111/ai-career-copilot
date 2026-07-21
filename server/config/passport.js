import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {

        const email =
          profile.emails?.[0]?.value.toLowerCase();

        let user =
          await User.findOne({
            googleId: profile.id,
          });

        if (user) {

          if (
            profile.photos?.length &&
            user.avatar !== profile.photos[0].value
          ) {
            user.avatar =
              profile.photos[0].value;

            await user.save();
          }

          return done(null, user);
        }

        user = await User.findOne({
          email,
        });

        if (user) {

          user.googleId = profile.id;

          if (profile.photos?.length) {
            user.avatar =
              profile.photos[0].value;
          }

          await user.save();

          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,

          email,

          googleId: profile.id,

          avatar:
            profile.photos?.[0]?.value ??
            null,
        });

        return done(null, user);

      } catch (err) {

        return done(err, null);

      }
    }
  )
);

export default passport;