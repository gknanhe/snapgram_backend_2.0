import express from "express";
import passport from "passport";
import multer from "multer";
import {
  followUnfollowUser,
  logoutUser,
  signinUser,
  signupUser,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { uploadImage } from "../controllers/cloudinaryController.js";
import { getPosts } from "../controllers/postsController.js";

const router = express.Router();

const upload = multer();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);
router.post("/logout", logoutUser);

//image routes

router.post("/upload", protectRoute, upload.single("file"), uploadImage);
router.get("/posts", protectRoute, getPosts);

router.post("/follow/:id", protectRoute, followUnfollowUser);
export default router;
