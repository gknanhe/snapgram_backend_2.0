import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { createMessage } from "../controllers/messageController.js";
import User from "../models/userModel.js";

const connectedUsers = new Map();

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (!name) return cookies;

    cookies[name] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});

const addConnectedUser = (userId, socketId) => {
  const sockets = connectedUsers.get(userId) || new Set();
  sockets.add(socketId);
  connectedUsers.set(userId, sockets);
};

const removeConnectedUser = (userId, socketId) => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    connectedUsers.delete(userId);
  }
};

const getOnlineUserIds = () => Array.from(connectedUsers.keys());

const initializeSocket = (server, clientOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.snapgToken;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    socket.join(`user:${userId}`);
    addConnectedUser(userId, socket.id);
    io.emit("onlineUsers", getOnlineUserIds());

    socket.on("typing", ({ receiverId, isTyping } = {}) => {
      if (!receiverId) return;

      socket.to(`user:${receiverId}`).emit("typing", {
        senderId: userId,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("sendMessage", async ({ receiverId, text } = {}, callback) => {
      try {
        const message = await createMessage({
          senderId: userId,
          receiverId,
          text,
        });
        const receiverUserId = message.receiver._id.toString();

        io.to(`user:${userId}`)
          .to(`user:${receiverUserId}`)
          .emit("newMessage", message);

        if (typeof callback === "function") {
          callback({ ok: true });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({ ok: false, message: error.message });
        }
      }
    });

    socket.on("disconnect", () => {
      removeConnectedUser(userId, socket.id);
      io.emit("onlineUsers", getOnlineUserIds());
    });
  });

  return io;
};

export default initializeSocket;
