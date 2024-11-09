import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  console.log(req);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    console.log(req.file);
    // Convert file buffer to a readable stream

    const buffer = req.file.buffer;

    //upload file to cloudinary

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "snapgram",
          timeout: 60000,
          transformation: [{ quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    //respond with success

    res.status(200).json({
      publicId: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload failed", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};
