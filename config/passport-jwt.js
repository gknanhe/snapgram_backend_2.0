import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import User from "../models/userModel.js";

export default function (passport) {
  //opts to pass
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      //jwtPayload will contain reqData
      try {
        const user = await User.findById(jwtPayload.id); //fin d user
        if (user) return done(null, user);
        return done(null, false);
      } catch (error) {
        return done(error, flase);
      }
    })
  );
}
