import protectRoute from "../middlewares/protectRoute.js";
import express from "express";

const router = express.Router();

router.post("/verify", protectRoute, (req, res) => {
  res.status(201).json({ ok: true, user: req.user });
});

export default router;
