import protectRoute from "../middlewares/protectRoute.js";
import express from "express";
import passport from "passport";
import { googleLogin } from "../controllers/userController.js";

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
    failureRedirect: "http://localhost:5173/sign-in",
  })
);

// Success

router.get("/callback/success", googleLogin);

router.get("/api/callback/failure", (req, res) => {
  res.send("Error");
});
export default router;
