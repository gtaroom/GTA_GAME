import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserModel from "../models/user.model";
import { log } from "console";
import dotenv from "dotenv";
import { AvailableRoles, rolesEnum } from "../constants";
dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user._id); // Store only the user ID in the session
});

// Deserialize user (fetch user from the database using the stored id)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URI as string,
    },
    async (_, __, profile, done) => {
      try {
        // Find or create a user based on the Google profile
        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          user = new UserModel({
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "", 
            googleId: profile.id,
            password:profile.id,
            avatar: {
              url: profile.photos?.[0]?.value,
              localPath: "",
            },
            loginType: "GOOGLE",
            role: rolesEnum["USER"],
            isEmailVerified:true
          });

          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, undefined);
      }
    }
  )
);

export default passport;
