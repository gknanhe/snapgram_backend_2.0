import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const userSelect = "name username profilePic";

const getParticipantKey = (firstUserId, secondUserId) =>
  [String(firstUserId), String(secondUserId)].sort().join(":");

const populateMessage = (messageId) =>
  Message.findById(messageId)
    .populate("sender", userSelect)
    .populate("receiver", userSelect);

const ensureValidReceiver = async (senderId, receiverId) => {
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    const error = new Error("Invalid receiver id");
    error.statusCode = 400;
    throw error;
  }

  if (String(senderId) === String(receiverId)) {
    const error = new Error("You cannot message yourself");
    error.statusCode = 400;
    throw error;
  }

  const receiver = await User.findById(receiverId).select(userSelect);

  if (!receiver) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return receiver;
};

const findConversationByUsers = (firstUserId, secondUserId) =>
  Conversation.findOne({
    participantKey: getParticipantKey(firstUserId, secondUserId),
  });

const createMessage = async ({ senderId, receiverId, text }) => {
  const cleanText = text?.trim();

  if (!cleanText) {
    const error = new Error("Message cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (cleanText.length > 2000) {
    const error = new Error("Message is too long");
    error.statusCode = 400;
    throw error;
  }

  await ensureValidReceiver(senderId, receiverId);

  const participantKey = getParticipantKey(senderId, receiverId);
  const conversation = await Conversation.findOneAndUpdate(
    { participantKey },
    {
      $setOnInsert: {
        participants: [senderId, receiverId],
        participantKey,
      },
    },
    { new: true, upsert: true }
  );

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    text: cleanText,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return populateMessage(message._id);
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", userSelect)
      .populate({
        path: "lastMessage",
        populate: [
          { path: "sender", select: userSelect },
          { path: "receiver", select: userSelect },
        ],
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    console.log(`Error in getConversations controller: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    await ensureValidReceiver(req.user._id, id);

    const conversation = await findConversationByUsers(req.user._id, id);

    if (!conversation) {
      return res.status(200).json({ conversation: null, messages: [] });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", userSelect)
      .populate("receiver", userSelect)
      .sort({ createdAt: 1 });

    return res.status(200).json({ conversation, messages });
  } catch (error) {
    console.log(`Error in getMessages controller: ${error.message}`);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await createMessage({
      senderId: req.user._id,
      receiverId: req.params.id,
      text: req.body.text,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.log(`Error in sendMessage controller: ${error.message}`);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message });
  }
};

export { createMessage, getConversations, getMessages, sendMessage };
