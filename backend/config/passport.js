import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";

// Ensure required environment variables exist
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is missing from the .env file.");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is missing from the .env file.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:4000/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        if (mongoose.connection.readyState !== 1) {
          return done(new Error("Database unavailable. Please try again later."), null);
        }

        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(new Error("Google account did not return an email address."), null);
        }

        // Try finding the user by Google ID or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email },
          ],
        });

        const firstName =
          profile.name?.givenName ||
          profile.displayName?.split(" ")[0] ||
          "Google";

        const lastName =
          profile.name?.familyName ||
          profile.displayName?.split(" ").slice(1).join(" ") ||
          "";

        const avatar = profile.photos?.[0]?.value || "";

        // Existing user
        if (user) {
          let updated = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            updated = true;
          }

          if (!user.verified) {
            user.verified = true;
            updated = true;
          }

          if (user.provider !== "google") {
            user.provider = "google";
            updated = true;
          }

          if (!user.avatar && avatar) {
            user.avatar = avatar;
            updated = true;
          }

          if (!user.firstName && firstName) {
            user.firstName = firstName;
            updated = true;
          }

          if (!user.lastName && lastName) {
            user.lastName = lastName;
            updated = true;
          }

          if (updated) {
            await user.save();
          }

          return done(null, user);
        }

        // New Google user
        const randomPassword = crypto.randomBytes(32).toString("hex");
        console.log("========================");
console.log("GOOGLE PROFILE");
console.log(profile);
console.log("========================");

console.log({
  firstName,
  lastName,
  email,
  avatar,
});
        user = await User.create({
          firstName,
          lastName,
          email,
          password: randomPassword,
          verified: true,
          provider: "google",
          googleId: profile.id,
          avatar,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;