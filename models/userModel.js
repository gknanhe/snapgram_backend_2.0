import mongoose from "mongoose";

const userSChema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    likedPosts: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSChema);

export default User;
