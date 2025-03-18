const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  sessionNo: { type: String, required: true, unique: false },
  topic: { type: String, default: "New Chat" } ,
  messages: [messageSchema], // Messages under sessionId
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  sessions: [sessionSchema], // Array of sessions under userId
});

const ChatHistory = mongoose.model("ChatHistory", chatSchema);

module.exports = ChatHistory;
