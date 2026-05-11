import mongoose from "mongoose";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const userProfile = async (req, res) => {
  const id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "No user found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("error in finding profile", error);
    res.status(500).json({ error: "An error occurred while fetching user" });
  }
};

export const userProfilePosts = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }

    const page = parseInt(req.body.page) || 1;
    const limit = 2;

    const skipIndex = (page - 1) * limit;

    const user = await User.findById(id);

    if (!user) {
      return res.status(204).json({ msg: "No user found" });
    }

    const posts = await Post.find({ postedBy: id })
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit)
      .populate("postedBy", "name profilePic");

    // console.log(posts);

    const totalPosts = await Post.countDocuments({ postedBy: id });

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.log("error in finding profile", error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
};
