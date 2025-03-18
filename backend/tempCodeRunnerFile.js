const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
require("./connection/connection");
const router = require("./routes/user"); 
const RR=require("./routes/chat")
const ChatHistory = require("./models/chatHistory"); // Chat Model

const PORT = process.env.PORT || 8000;

// Middleware
const app = express();

app.use(express.json());
app.use(cors());
 // Routes
app.use(router);
app.use(RR);

// Test Route
app.get("/", (req, res) => {
    res.send("Hello pong");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
});

//  yaha 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.post("/api/chat", async (req, res) => {
    const { userId, sessionId, message } = req.body;
    if (!userId || !message || sessionId === undefined) {
        return res.status(400).json({ error: "User ID, session ID, and message are required." });
    }

    try {
        let chat = await ChatHistory.findOne({ userId });

        // If no chat history exists, create a new one
        if (!chat) {
            chat = new ChatHistory({ userId, sessions: [] });
        }
