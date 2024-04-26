import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/helpers/generateToken.js";

//signup user
const signupUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ message: "User already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hassesPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      email,
      password: hassesPassword,
    });

    //save newUser to DB
    await newUser.save();

    if (newUser) {
      //generate token

      generateToken(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log(`Error in signupUser: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

//login user
const signinUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "No user found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid username or password" });

    //generate token
    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log(`Error in signupUser: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export { signupUser, signinUser };
