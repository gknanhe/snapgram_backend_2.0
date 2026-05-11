import Post from "../models/postModel.js";

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort("-createdAt")
      .populate("postedBy", "name profilePic");

    if (!posts) return res.status(200).json({});

    return res.status(200).json([posts]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
};

export { getPosts };
