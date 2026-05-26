import jwt from "jsonwebtoken";
import getAuthCookieOptions from "./cookieOptions.js";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  return res.cookie("snapgToken", token, {
    ...getAuthCookieOptions(),
  });

  // return token;
};

export default generateToken;
