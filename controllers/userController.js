import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/helpers/generateToken.js";
import passport from "passport";

//signup user
const signupUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, username } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ msg: "User already Exists" });
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

      // res.status(201).json({
      //   _id: newUser._id,
      //   name: newUser.name,
      //   username: newUser.username,
      //   email: newUser.email,
      // });
      res.status(201).json({
        ok: true,
        msg: "User Registerd",
      });
    } else {
      res.status(400).json({ msg: "Invalid user data" });
    }
  } catch (error) {
    console.log(`Error in signupUser: ${error.message}`);
    res.status(500).json({ msg: error.message });
  }
};

//login user

// const signinUser = async (req, res) => {
//   try {
//     const { username, password, email } = req.body;

//     const user = await User.findOne(email ? { email } : { username });
//     if (!user) return res.status(404).json({ message: "No user found" });

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);

//     if (!isPasswordCorrect)
//       return res.status(400).json({ message: "Invalid username or password" });

//     //generate token
//     generateToken(user._id, res);

//     return res.status(200).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       username: user.username,
//       profilePic: user.profilePic,
//     });
//   } catch (error) {
//     console.log(`Error in sigInpUser controller: ${error.message}`);
//     res.status(500).json({ message: error.message });
//   }
// };

const signinUser = async (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: "Error in sign in" });
    }

    if (!user) {
      return res.status(400).json({ msg: info.msg || "Invalid credentials" });
    }

    //Generate token if authentication is successful

    // const token =
    generateToken(user._id, res);

    // Exclude password from the user object
    const { password, ...userWithoutPassword } = user.toObject();

    //send res back

    return res.json({
      msg: "Logged in successfuly",
      // token,
      user: userWithoutPassword,
    });
  })(req, res);
};

//logout user

const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: "Failed to log out" });
    }

    res.clearCookie("snapgToken");
    res.status(200).json({ msg: "Logged out successfully", user: null });
  });
};

//follow unfollow

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToModify = await User.findById(id);

    if (!userToModify)
      return res.status(404).json({ message: "can't perform action" });

    const currentUser = await User.findById(req.user._id);

    if (String(id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot follow/unfollow yourself" });
    }
    //follow unfollow toggle

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow

      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    } else {
      //follow
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    }

    const msg = isFollowing
      ? "Unfollowed successfully"
      : "Followed successfully";

    return res.status(200).json({ message: msg });
  } catch (error) {
    console.log(`Error in followunfollow controller: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
export { signupUser, signinUser, logoutUser, followUnfollowUser };
