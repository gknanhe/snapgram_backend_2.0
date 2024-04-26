import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("Mongodb Connected");
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
