const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/chatHistory");



router.get("/api/history/:userId", async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
  }

  try {
      const chat = await ChatHistory.findOne({ userId });
      
      if (!chat) {
          return res.status(404).json({ error: "Chat history not found." });
      }

      res.status(200).json({ success: true, chatHistory: chat });
  } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
  });
  

module.exports = router;
