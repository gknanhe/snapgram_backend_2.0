import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoute from "./routes/authRoute.js";
import passport from "passport";
import initializePassport from "./config/passport-local.js";
import cors from "cors";
import session from "express-session";
dotenv.config();

connectDB();
const app = express();

const PORT = process.env.PORT || 8000;

// Initialize passport
initializePassport(passport);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json()); // to parse JSON data in req.body
app.use(express.urlencoded({ extended: true })); // to parse form data in req.body
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoute);

app.listen(PORT, () => console.log(`Server started at ${PORT}`));
