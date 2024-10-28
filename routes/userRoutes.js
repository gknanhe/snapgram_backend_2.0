import express from "express";
import passport from "passport";
import {
  followUnfollowUser,
  logoutUser,
  signinUser,
  signupUser,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);
router.post("/logout", logoutUser);

router.post("/follow/:id", protectRoute, followUnfollowUser);
export default router;
