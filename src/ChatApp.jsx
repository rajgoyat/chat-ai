import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const randomReplies = [
  "Hello!", "How are you?", "Nice to meet you!", "What's up?", "Have a great day!",
  "Tell me more!", "Interesting!", "I agree!", "Let's talk!", "That sounds fun!"
];

const ChatApp = () => {
  const [chats, setChats] = useState([{ id: 1, messages: [] }]);
  const [activeChat, setActiveChat] = useState(1);
  const [input, setInput] = useState("");
console.log(chats)
  const sendMessage = () => {
    if (!input.trim()) return;
    const newChats = chats.map(chat => {
      if (chat.id === activeChat) {
        return { ...chat, messages: [...chat.messages, { sender: "user", text: input }, { sender: "bot", text: randomReplies[Math.floor(Math.random() * randomReplies.length)] }] };
      }
      return chat;
    });
    setChats(newChats);
    setInput("");
  };

  const newChat = () => {
    if (chats.some(chat => chat.id === activeChat && chat.messages.length === 0)) return;
    const newChatId = chats.length + 1;
    setChats([...chats, { id: newChatId, messages: [] }]);
    setActiveChat(newChatId);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 border-end">
          <h5>Chat History</h5>
          {chats.map(chat => (
            <button
              key={chat.id}
              className={`btn btn-light w-100 my-1 ${activeChat === chat.id ? "fw-bold" : ""}`}
              onClick={() => setActiveChat(chat.id)}
            >
              Chat {chat.id}
            </button>
          ))}
          <button className="btn btn-primary w-100 mt-2" onClick={newChat}>New Chat</button>
        </div>

        {/* Chat Window */}
        <div className="col-md-9">
          <div className="chat-box border p-3" style={{ height: "400px", overflowY: "auto" }}>
            {chats.find(chat => chat.id === activeChat)?.messages.map((msg, index) => (
              <div key={index} className={`text-${msg.sender === "user" ? "end" : "start"} mb-2`}>
                <span className={`badge bg-${msg.sender === "user" ? "primary" : "secondary"}`}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="input-group mt-2">
            <input type="text" className="form-control" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button className="btn btn-success" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;