import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.snapgToken;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user)
      return res.status(401).json({ message: "Unauthorized - no user found" });

    req.user = user;

    next();
  } catch (error) {
    console.log(`Error in protectRoute middleware: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export default protectRoute;
