// import React, { useRef, useState } from "react";
// import { GrSend } from "react-icons/gr";

// const Mainpage = ({ chats = [], activeChat, setActiveChat, handleSendMessage, loading }) => {
//   const chatEndRef = useRef(null);
//   const [message, setMessage] = useState("");

//   const sendMessage = () => {
//     if (!message.trim()) return;
//     handleSendMessage(message);
//     setMessage("");
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-window">
//         {chats?.find((chat) => chat.id === activeChat)?.messages?.map((msg, index) => (
//           <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
//         )) || <p>No messages yet.</p>}
//         {loading && <p>Typing...</p>}
//       </div>
//       <input
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//       />
//       <button onClick={sendMessage}><GrSend /></button>
//     </div>
//   );
// };

// export default Mainpage;
