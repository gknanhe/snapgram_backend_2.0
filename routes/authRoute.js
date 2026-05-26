import protectRoute from "../middlewares/protectRoute.js";
import express from "express";
import passport from "passport";
import { googleLogin } from "../controllers/userController.js";
import dotenv from "dotenv";
import { getClientUrl } from "../utils/helpers/clientUrl.js";

dotenv.config();

const router = express.Router();

router.post("/verify", protectRoute, (req, res) => {
  res.status(201).json({ ok: true, user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/api/auth/callback/success",
    failureRedirect: `${getClientUrl()}/sign-in`,
  })
);

// Success

router.get("/callback/success", googleLogin);

router.get("/api/callback/failure", (req, res) => {
  res.redirect(`${getClientUrl()}/sign-in`);
});
export default router;
