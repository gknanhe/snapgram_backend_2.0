import express from "express";
import passport from "passport";
import multer from "multer";
import {
  followUnfollowUser,
  getSavedPosts,
  getUsers,
  logoutUser,
  signinUser,
  signupUser,
  toggleSavePost,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { uploadImage } from "../controllers/cloudinaryController.js";
import {
  addComment,
  addReply,
  getPost,
  getPosts,
  toggleLikeComment,
  toggleLikePost,
  toggleLikeReply,
} from "../controllers/postsController.js";
import {
  userProfile,
  userProfilePosts,
} from "../controllers/profileController.js";

const router = express.Router();

const upload = multer();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);
router.post("/logout", logoutUser);

//image routes

router.post("/upload", protectRoute, upload.single("file"), uploadImage);
router.get("/posts", protectRoute, getPosts);
router.get("/posts/:id", protectRoute, getPost);
router.post("/posts/:id/like", protectRoute, toggleLikePost);
router.post("/posts/:id/comments", protectRoute, addComment);
router.post(
  "/posts/:id/comments/:commentId/like",
  protectRoute,
  toggleLikeComment
);
router.post("/posts/:id/comments/:commentId/replies", protectRoute, addReply);
router.post(
  "/posts/:id/comments/:commentId/replies/:replyId/like",
  protectRoute,
  toggleLikeReply
);
router.post("/posts/:id/save", protectRoute, toggleSavePost);
router.get("/saved-posts", protectRoute, getSavedPosts);
router.get("/all", protectRoute, getUsers);

//profile routes
router.get("/profile/:id", protectRoute, userProfile);
router.post("/profile/:id/posts", protectRoute, userProfilePosts);
router.post("/follow/:id", protectRoute, followUnfollowUser);
export default router;
