import bcrypt from "bcryptjs";
import { Strategy as LocalStategy } from "passport-local";

import User from "../models/userModel.js";

const initializePassport = (passport) => {
  passport.use(
    new LocalStategy(
      { usernameField: "identifier", passwordField: "password" },
      async (identifier, password, done) => {
        try {
          // Check if identifier is an email (using a basic regex)

          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

          const user = isEmail
            ? await User.findOne({ email: identifier })
            : await User.findOne({ username: identifier }); //fin d user
          // const user = await User.findOne({ email });
          if (!user) return done(null, false, { msg: "User not found" });

          //check password
          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordCorrect)
            return done(null, false, {
              msg: "Invalid username or password",
            });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;
