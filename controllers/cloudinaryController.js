import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Post from "../models/postModel.js";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  // console.log(req.body.caption);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Optimize the image using Sharp
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024 }) // Adjust width as needed
      .avif({ quality: 80 }) // Convert to avif with 80% quality
      .toBuffer();

    // Upload optimized image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "snapgram",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(optimizedBuffer);
    });

    //find user and upload img url and data in db

    const newPost = new Post({
      postedBy: req.user._id,
      caption: req.body.caption,
      tags: req.body.tags,
      img: result.public_id,
      imgUrl: result.secure_url,
    });

    await newPost.save();

    // Respond with success

    res.status(200).json({ post: newPost });
    // res.status(200).json({
    //   publicId: result.public_id,
    //   url: result.secure_url,
    // });
  } catch (error) {
    console.error("Image upload failed", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};
