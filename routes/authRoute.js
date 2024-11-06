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
  passport.authenticate(
    "google",
    {
      successRedirect: "/api/auth/callback/success",
      failureRedirect: "http://localhost:5173/sign-in",
    }
    // async (req, res) => {
    //   try {
    //     // Wait for Passport to finish authentication
    //     await passport.authenticate("google")(req, res); // Use next() here
    //     console.log("first", req.user);

    //     // Now `req.user` should be populated
    //     // ... rest of your code
    //   } catch (error) {
    //     console.error("Error in Google auth callback:", error);
    //     return res.redirect("/sign-in");
    //   }
    // }
  )
);

// Success

// (req, res) => {
//   if (!req.user) res.redirect("/api/auth/callback/failure");
//   res.json(req.user);
// }
router.get("/callback/success", googleLogin);

router.get("/api/callback/failure", (req, res) => {
  res.send("Error");
});
export default router;
