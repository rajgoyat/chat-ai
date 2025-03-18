
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BsEmojiSmile } from "react-icons/bs";
import { TiAttachmentOutline } from "react-icons/ti";
import { GrSend } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { SiPolestar } from "react-icons/si";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { authActions } from "../store/auth";
import boy from "../imgs/user.webp";  
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState();
  const [LOG, setLOG] = useState("");
  const [history, setHistory] = useState([]);
  const userId = localStorage.getItem("id");
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log(userId)
        const response = await axios.get(
          `http://localhost:8000/api/history/${userId}`
        );
  
        // Ensure chatHistory is always an array, even if it's null or undefined
        setHistory(response?.data?.chatHistory || []);
      } catch (error) {
        console.error("History fetch karne me error:", error);
        
        // Set history to an empty array in case of an error
        setHistory([]);
      }
    };
  
    if (userId) {
      fetchHistory();
    }
  }, [userId]);
  
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLOG = () => {
    setLOG(!LOG);
  };

  const TruncateText = ({ text }) => (
    <span style={{ color: "#575b5f", fontSize: "15px", fontWeight: "400" }}>
      {text?.length > 24 ? text.substring(0, 24) + "..." : text}
    </span>
  );
  // user information
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get(
        "http://localhost:8000/get-user-information",
        { headers }
      );
      setProfile(response.data.username);
    };
    fetch();
  }, []);
  // mainpage functions

  const [chats, setChats] = useState([{ id:1, messages: [], topic:'New Chat' }]);
  const [activeChat, setActiveChat] = useState(1);
  const chatEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [replied,setReplied]= useState(true)
  const isFirstRun = useRef(true);  
  
  useEffect(() => {
    if (isFirstRun.current && history?.sessions?.length > 0) {
      const mappedChats = history.sessions.map((session, index) => ({
        id: index + 1, // IDs start from 1
        messages: session.messages || [],
        topic:session?.topic|| 'New Chat'
      }));
      console.log(mappedChats)
      // Find max ID from existing chats (or start from 1 if no chats exist)
      const lastId = mappedChats.length > 0 ? Math.max(...mappedChats.map(chat => chat.id)) : 0;
      const newEmptyChat = { id: lastId + 1, messages: [], topic:'New Chat' };
      // Set chats with extra empty chat
      setChats([...mappedChats, newEmptyChat]);
      setActiveChat(lastId + 1); // Set active chat to the new empty one
      isFirstRun.current = false;
    }
  }, [history]);
   // Runs when `history` changes, but only executes logic once
   const handleNewChat = () => {
    setMessage('')
    setLoading(false)
    setReplied(true);    // Find active chat object
    const activeChatObj = chats.find(chat => chat.id === activeChat);  // Agar active chat already empty hai, toh wahi select karo
    if (activeChatObj && activeChatObj.messages.length === 0) {
        setActiveChat(activeChatObj.id);
        console.log(`Switched to existing empty chat: ${activeChatObj.id}`);
        return;
    }
    // Get last chat
    const lastChat = chats[chats.length - 1];    // Agar last chat empty hai, toh wahi select karo
    if (lastChat && lastChat.messages.length === 0) {
        setActiveChat(lastChat.id);
        return;
    }    // Create new chat if no empty chat exists
    const newId = chats.length > 0 ? Math.max(...chats.map(chat => chat.id)) + 1 : 1;
    setChats([...chats, { id: newId, messages: [], topic:'New Chat' }]);
    setActiveChat(newId);
};

  
  const handleSend = () => {
    if (message.trim() !== "" && replied) {
      setLoading(true)
      handleSendMessage(message);
      setMessage("");
    }
    setReplied(false)
  };
  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;
  
    const userId = localStorage.getItem("id"); // Get userId from localStorage
    const sessionNo = activeChat // Use activeChat as sessionNo
    // Update frontend state for user message
    setChats((prevChats) =>
      prevChats.map((chat) => {

        return Number(chat.id) === Number(activeChat)
          ? {
              ...chat,
              messages: [...chat.messages, { sender: "user", text: userMessage }],
            }
          : chat;
      })
    );
    
    
  
    try {
      // Send user message to backend and get bot response
      const response = await axios.post("http://localhost:8000/api/chat", {
        userId,
        sessionNo,
        message: userMessage,
      });
      let botMessage = "";
      let topicName = "";
  
      const botResponse = response.data.response;
      setReplied(true)
      setLoading(false)
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, { sender: "bot", text: "" }] }
            : chat
        )
      );
      const newTopic = response.data.topic || "New Chat";
      // Stream topic name
      for (let i = 0; i < newTopic.length; i++) {
        topicName += newTopic[i];
  
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChat ? { ...chat, topic: topicName } : chat
          )
        );
  
        await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust speed for topic
      }
  
  for (let i = 0; i < botResponse.length; i++) {
    botMessage += botResponse[i];

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: chat.messages.map((msg, index) =>
                index === chat.messages.length - 1 && msg.sender === "bot"
                  ? { ...msg, text: botMessage }
                  : msg
              ),
            }
          : chat
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 30)); // Simulates typing effect
  }

    } catch (error) {
      setReplied(true)
      setLoading(false)
      setMessage('')
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [...chat.messages, { sender: "bot", text: "some error" }],
                topic: "Error"
              }
            : chat
        )
      );
      
      
      console.error("Error processing chat:", error);
    }
  };
  
  // user information
  const [copiedIndex, setCopiedIndex] = useState(null);
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    // 2 second ke baad copied text hata dega
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const activeChatObj = chats.find(chat => chat.id === activeChat);
  return (
    <>
      <div
        className="d-flex position-relative containt"
        style={{ height: "100vh" }}
      >
        {/* Sidebar ko fixed width diya */}
        {isOpen && (
          <div
            className=" d-flex flex-column"
            style={{
              width: "320px",
              background: "#f0f4f9",
              zIndex: "1000",
              borderRight: "1px solid black",
              padding: "15px 0 0 12px",
            }}
          >
            <div style={{ height: "30px", width: "30px" }} className=" m-2">
              <TbLayoutSidebarFilled
                onClick={() => setIsOpen(false)}
                className="HOVERFIRST h-100 w-100 cr"
              />
            </div>
            <div className="px-3">
              <div className="d-flex gap-2 align-items-center my-4">
                <SiPolestar style={{ color: "#3DC2EC", fontSize: "20px" }} />
                <span style={{ fontWeight: "400" }}>ChatBOT</span>
              </div>
              <h1
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#1b1c1d",
                  marginTop: "10px",
                }}
              >
                Recent
              </h1>
            </div>
            <div
              className="d-flex flex-column gap-1 "
              style={{ flexGrow: 1, paddingRight: "5px", overflowY: "scroll" }}
            >
             {chats?.slice().reverse().map((item) => (
  <div 
    onClick={() => { 
      setActiveChat(item.id);  // item.id se set karna sahi hoga
    }}
    key={item.id} // Unique key dena better hai
    style={{
      height: "40px",
      width: "250px",
      cursor: "pointer",
      padding: "10px",
    }}
    className="d-flex gap-2 align-items-center HOVER rounded-pill"
  >
    <HiOutlineBars3BottomLeft style={{ fontSize: "20px" }} />
    <TruncateText text={item.topic} />
  </div>
))}

            </div>
          </div>
        )}

        {/* Ye bachi hui poori width le lega */}
        <div style={{ flexGrow: 1 }}>
          <div
            style={{ width: "100%", height: "50px", zIndex: "1" }}
            className="main  position-relative"
          >
            <div
              className="TopBar position-absolute w-100  d-flex align-items-center bg-white justify-content-between "
              style={{ height: "50px" }}
            >
              <div className="dalju gap-2">
                {!isOpen && (
                  <div>
                    <TbLayoutSidebarFilled
                      style={{
                        height: "27px",
                        width: "27px",
                        cursor: "pointer",
                        margin: "10px",
                      }}
                      onClick={() => setIsOpen(true)}
                      className="HOVERFIRST"
                    />
                  </div>
                )}
                <h3 style={{ fontWeight: "400", fontSize: "20px" }}>ChatBOT</h3>
              </div>
              <div className="dalju gap-2">
                {!isLoggedIn && (
                  <div
                    className="rounded-pill bg-primary p-2 cr"
                    style={{ color: "white", fontWeight: "400" }}
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </div>
                )}
                {isLoggedIn && (
                  <span
                    className="fst-italic text-primary"
                    style={{ fontWeight: "400", fontSize: "20px" }}
                  >
                    {profile}
                  </span>
                )}
                {isLoggedIn && (
                  <img
                    src={boy}
                    style={{
                      height: "35px",
                      aspectRatio: "1",
                      borderRadius: "50%",
                    }}
                    alt="img"
                    onClick={handleLOG}
                    className="cr"
                  />
                )}
              </div>
              {isLoggedIn && (
                <div
                  className="text-danger position-absolute cr"
                  onClick={() => {
                    dispatch(authActions.logout());
                    localStorage.clear("id");
                    localStorage.clear("token");
                    navigate("/");
                  }}
                  style={{
                    display: LOG ? "block" : "none",
                    border: "1px solid black ",
                    padding: "20px",
                    borderRadius: "6px",
                    right: "10px",
                    background: "#e5e5e5",
                    top: "50px",
                    zIndex: "1",
                  }}
                >
                  Log Out
                </div>
              )}
            </div>
          </div>
{/* 

          {/* code of mainpage */}
          <div className="" style={{ height: "92vh", width: "100%" }}>
            {/* bottom */}
            <div
              className="chat-window p-2"
              style={{ height: "calc(100% - 120px)", overflowY: "scroll" }}
            >
              {activeChatObj && activeChatObj.messages.length === 0 === 0 && (
                <div className="w-100 h-100 dalju">
                  {!isLoggedIn && (
                    <h1 className="fst-italic text-primary">hello users...</h1>
                  )}
                  {isLoggedIn && (
                    <h1 className="fst-italic text-primary">hello {profile}</h1>
                  )}
                </div>
              )}
             {activeChatObj?.messages?.map((msg, index) => {
  if (!msg || typeof msg !== "object") {
    console.error(`Invalid message at index ${index}:`, msg);
    return null;
  }


  // Ensure msg.content exists, else fallback to msg.text
  const messageContent = msg.content || msg.text || "";

  const regex = /```([\w]*)\n([\s\S]*?)```/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(messageContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: messageContent.slice(lastIndex, match.index),
      });
    }
    parts.push({ type: "code", content: match[2].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < messageContent.length) {
    parts.push({
      type: "text",
      content: messageContent.slice(lastIndex),
    });
  }
  return (
    <div
      key={index}
      className={`message_bubble_first ${
        msg.sender === "user" ? "user" : "bot"
      }`}
      ref={chatEndRef}
    >
      <div
        className={`message_bubble_second ${
          msg.sender === "user" ? "user" : "bot"
        }`}
      >
        {parts.map((part, i) =>
      
          part.type === "code" ? (
            <div key={i} style={{ position: "relative", marginBottom: "10px" }}>
              <pre
                style={{
                  background: "#f4f4f4",
                  borderRadius: "5px",
                  overflowX: "auto",
                }}
                className="pre_code"
              >
                <code>{part.content}</code>
              </pre>
              <button
                onClick={() => handleCopy(part.content, `${index}-${i}`)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background:
                    copiedIndex === `${index}-${i}` ? "#4CAF50" : "#3DC2EC",
                  color: "white",
                  border: "none",
                  padding: "5px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                {copiedIndex === `${index}-${i}` ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p key={i} className="m-1">{part.content}</p> // Normal text
          )
        )}
      </div>
    </div>
  );
})}
              {loading && (
                <div class="three-body">
                  <div class="three-body__dot"></div>
                  <div class="three-body__dot"></div>
                  <div class="three-body__dot"></div>
                </div>
              )}
            </div>

            {/* </div> */}
            {/* bottom */}
            <div
              className="position-relative"
              style={{ height: "53px", bottom: "0px" }}
            ><div onClick={handleNewChat}>New Chat</div>
              <div className="inputText position- dalju gap-2  ">
                <div
                  style={{ padding: "10px", border: "1px solid #c4c7c5" }}
                  className="bg-white dalju rounded-pill INPUT"
                >
                  <button style={{ border: "none", background: "none" }}>
                    <BsEmojiSmile className="fs-4" />
                  </button>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    style={{
                      border: "none",
                      background: "none",
                      outline: "none",
                      height: "30px",
                      resize: "none",
                    }}
                    className="w-100"
                  />
                  <button style={{ border: "none", background: "none" }}>
                    <TiAttachmentOutline className="fs-4" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  style={{
                    height: "45px",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    border: "none",
                    background: "#3DC2EC",
                  }}
                  className="dalju "
                >
                  <GrSend className="fs-4" />
                </button>
              </div>
            </div>
          </div>
          {/* end of main page  */}
        </div>
      </div>
    </>
  );
};

export default Homepage;
