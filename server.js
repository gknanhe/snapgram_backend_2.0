import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoute from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import passport from "passport";
import initializePassport from "./config/passport-local.js";
import cors from "cors";
import session from "express-session";
import "./config/passport-google-oauth.js";
import http from "http";
import initializeSocket from "./socket/socket.js";
import { getClientOrigin } from "./utils/helpers/clientUrl.js";
// import https from "https";
dotenv.config();

connectDB();
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === "production";
const CLIENT_ORIGIN = getClientOrigin();

// https.globalAgent.options.rejectUnauthorized = false;

// Initialize passport
initializePassport(passport);
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
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
app.use("/api/messages", messageRoutes);

initializeSocket(server, CLIENT_ORIGIN);

server.listen(PORT, () => console.log(`Server started at ${PORT}`));
