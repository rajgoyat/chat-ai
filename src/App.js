
import "bootstrap/dist/css/bootstrap.css";
 import "bootstrap/dist/js/bootstrap.bundle.js";
import Loginpage from "./Components/Loginpage";
import "./App.css"
import { ToastContainer } from "react-toastify";
import { Route, Routes } from 'react-router-dom';
import Registerpage from "./Components/Registerpage";
import Homepage from "./Components/Homepage";
const App = () => {
  return (
    <>
       <ToastContainer position="top-right" autoClose={2000} />
       
<Routes>
<Route  path="/" element={ <Homepage/>} />
<Route  path="/Register" element={ <Registerpage/>} />
<Route  path="/Login" element={ <Loginpage/>} />

</Routes>

    </>
  );
};

export default App; 
// import React from "react";
// import ChatPage from "./pages/ChatPage";

// function App() {
//   return (
//     <div className="app-container">
//       <ChatPage />
//     </div>
//   );
// }

// export default App;
