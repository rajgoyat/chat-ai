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
    const { userId, sessionNo, message } = req.body;
    if (!userId || !message || sessionNo === undefined) {
        return res.status(400).json({ error: "User ID, session ID, and message are required." });
    }

    try {
        let chat = await ChatHistory.findOne({ userId });

        // If no chat history exists, create a new one
        if (!chat) {
            chat = new ChatHistory({ userId, sessions: [] });
        }

        // Ensure sessionNo corresponds to a valid index in the sessions array
        while (chat.sessions.length <= sessionNo) {
            chat.sessions.push({ sessionNo: chat.sessions.length, messages: [] });
        }

        // Add user message to the correct session
        chat.sessions[sessionNo].messages.push({ sender: "user", text: message });

        // Fetch response from Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(message);
        const botResponse = result.response.candidates[0].content.parts.map((part) => part.text).join("");
        // Add bot response to the correct session
        chat.sessions[sessionNo].messages.push({ sender: "bot", text: botResponse });


        if (chat.sessions[sessionNo].topic === "New Chat") {
            const firstUserMessage = chat.sessions[sessionNo].messages.find(msg => msg.sender === "user")?.text;
            if (firstUserMessage) {
                let generatedTopic;
                let isDuplicate = true; // Assume duplicate initially
        
                while (isDuplicate) {
                    const topicResult = await model.generateContent(
                        `Provide only the main topic name of this message in 1-2 meaningfull  speeling topic should not be single letter: "${firstUserMessage}". 
                         Ensure it's unique from these topics: [${Object.values(chat.sessions).map(s => `"${s.topic}"`).join(", ")}]. 
                         If it’s a duplicate, generate a different relevant topic. Do not include extra text.`
                    );
        
                    generatedTopic = topicResult.response.candidates[0].content.parts.map(part => part.text).join("");
        console.log(generatedTopic)
                    // ✅ Extract only the first word if topic contains "/", "or", "\n", or ","
                    if (generatedTopic.includes("/") || generatedTopic.includes(",")) {
                        generatedTopic = generatedTopic.split(/[\/,\nor]/)[0].trim();
                    }
        
                    // ✅ Check if topic is already used
                    isDuplicate = Object.values(chat.sessions).some(session => session.topic === generatedTopic);
                }
        
                // ✅ Store only if a valid topic is generated
                if (generatedTopic && generatedTopic !== "New Chat") {
                    chat.sessions[sessionNo].topic = generatedTopic;
                }
            }
        }
        
        

        // Save the updated chat history
        await chat.save();

        res.status(200).json({ success: true, response: botResponse,topic: chat.sessions[sessionNo].topic, sessionNo:sessionNo });
    } catch (error) {
        console.error("Error processing chat:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});

// app.post("/api/chat", async (req, res) => {
//     const { userId,sessionNo, message } = req.body;
//     if (!userId || !message || !sessionNo) {
//       return res.status(400).json({ error: "User ID, session ID, and message are required." });
//     }

//     try {
//       let chat = await ChatHistory.findOne({ userId });
//       if (!chat) {
//         chat = new ChatHistory({ userId, sessions: [] });
//       }

//       let sessionIndex = chat.sessions.findIndex(s => s.sessionId === sessionId);
//       if (sessionIndex === -1) {
//         chat.sessions.push({ sessionId, messages: [{ sender: "user", text: message }] });
//       } else {
//         chat.sessions[sessionIndex].messages.push({ sender: "user", text: message });
//       }

//       // Fetch response from Gemini AI
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
//       const result = await model.generateContent(message);
//       const botResponse = result.response.candidates[0].content.parts.map((part) => part.text).join("");

//       if (sessionIndex === -1) {
//         chat.sessions[chat.sessions.length - 1].messages.push({ sender: "bot", text: botResponse });
//       } else {
//         chat.sessions[sessionIndex].messages.push({ sender: "bot", text: botResponse });
//       }

//       await chat.save();

//       res.status(200).json({ success: true, response: botResponse }); 
//     } catch (error) {
//       console.error("Error processing chat:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
// });
