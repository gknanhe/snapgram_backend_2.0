import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
dotenv.config();

passport.serializeUser((user, done) => {
  console.log("inside serialize");
  done(null, user._id); // Store the user's ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password"); // Find the user without the password
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google profile", profile);
      try {
        let existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (!existingUser) {
          const hassesPassword = await hashPassword();

          const username = await generateUsername(profile.displayName);

          const newUser = new User({
            name: profile.displayName,
            username,
            email: profile.emails[0].value,
            password: hassesPassword,
          });

          //save newUser to DB
          existingUser = await newUser.save();
        }

        // Exclude password from the user object
        const { password, ...userWithoutPassword } = existingUser.toObject();
        const newUser = userWithoutPassword;
        // console.log(newUser);
        //send res back
        return done(null, newUser);
      } catch (error) {
        console.log("error in google auth user creation", error);
      }
    }
  )
);

async function hashPassword() {
  const pass = crypto.randomBytes(20).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(pass, salt);
  return hashedPassword;
}

async function generateUsername(name) {
  const uniqueID = Date.now().toString(36); // Generate a unique timestamp-based ID
  const sanitized = name.replace(/\s+/g, "").toLowerCase(); // Remove spaces and lowercase
  return `${sanitized}_${uniqueID}`;
}

export default passport;
