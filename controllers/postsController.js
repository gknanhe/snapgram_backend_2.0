import mongoose from "mongoose";
import Post from "../models/postModel.js";

const populatePost = (query) => query.populate("postedBy", "name profilePic");

const isInvalidObjectId = (id) => !mongoose.Types.ObjectId.isValid(id);

const getPosts = async (req, res) => {
  try {
    const posts = await populatePost(Post.find({}).sort("-createdAt"));

    if (!posts) return res.status(200).json([]);

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid post id" });
    }

    const post = await populatePost(Post.findById(id));

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching post" });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid post id" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const hasLiked = post.likes.some((like) => like.equals(userId));

    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      msg: hasLiked ? "Post unliked" : "Post liked",
      likes: post.likes,
      liked: !hasLiked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while liking post" });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid post id" });
    }

    if (!text?.trim()) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push({
      userId: req.user._id,
      text: text.trim(),
      username: req.user.username,
      userProfilePic: req.user.profilePic,
    });

    await post.save();

    const comment = post.comments[post.comments.length - 1];

    return res.status(201).json({ msg: "Comment added", comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while adding comment" });
  }
};

const toggleLikeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    if (isInvalidObjectId(id) || isInvalidObjectId(commentId)) {
      return res.status(400).json({ msg: "Invalid id" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    comment.likes = comment.likes || [];
    const hasLiked = comment.likes.some((like) => like.equals(userId));

    if (hasLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      msg: hasLiked ? "Comment unliked" : "Comment liked",
      likes: comment.likes,
      liked: !hasLiked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while liking comment" });
  }
};

const addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    if (isInvalidObjectId(id) || isInvalidObjectId(commentId)) {
      return res.status(400).json({ msg: "Invalid id" });
    }

    if (!text?.trim()) {
      return res.status(400).json({ msg: "Reply text is required" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    comment.replies.push({
      userId: req.user._id,
      text: text.trim(),
      username: req.user.username,
      userProfilePic: req.user.profilePic,
    });

    await post.save();

    const reply = comment.replies[comment.replies.length - 1];

    return res.status(201).json({ msg: "Reply added", reply });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while adding reply" });
  }
};

const toggleLikeReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const userId = req.user._id;

    if (
      isInvalidObjectId(id) ||
      isInvalidObjectId(commentId) ||
      isInvalidObjectId(replyId)
    ) {
      return res.status(400).json({ msg: "Invalid id" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({ msg: "Reply not found" });
    }

    reply.likes = reply.likes || [];
    const hasLiked = reply.likes.some((like) => like.equals(userId));

    if (hasLiked) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      msg: hasLiked ? "Reply unliked" : "Reply liked",
      likes: reply.likes,
      liked: !hasLiked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while liking reply" });
  }
};

export {
  getPosts,
  getPost,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  addReply,
  toggleLikeReply,
};
