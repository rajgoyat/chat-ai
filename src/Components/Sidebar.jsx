import React, { useState } from "react";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { SiPolestar } from "react-icons/si";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const TruncateText = ({ text }) => (
    <span style={{ color: "#575b5f", fontSize: "15px", fontWeight: "400" }}>
      {text.length > 24 ? text.substring(0, 24) + "..." : text}
    </span>
  );

  return (
    <>
      {isOpen ? (
        <div
          className=" d-flex flex-column"
          style={{ width:"100%", background: "#f0f4f9", zIndex: "1000", borderRight: "1px solid black" }}
        >
          <div className="" style={{padding:'11px 0 0 10px'}}>
            <TbLayoutSidebarFilled
              onClick={() => setIsOpen(false)}
              style={{ height: "27px", width: "27px", cursor: "pointer" }}
            />
          </div>
          <div className="px-3">
            <div className="d-flex gap-2 align-items-center">
              <SiPolestar style={{ color: "#3DC2EC", fontSize: "20px" }} />
              <span style={{ fontWeight: "400" }}>ChatBOT</span>
            </div>
            <h1 style={{ fontWeight: "500", fontSize: "14px", color: "#1b1c1d", marginTop: "10px" }}>Recent</h1>
          </div>
          <div
            className="d-flex flex-column gap-3 "
            style={{ flexGrow: 1, paddingRight: "5px", overflowY:'scroll' }}
          >
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                style={{ height: "30px", width: "250px", cursor: "pointer", margin:'0 0 0 4px' }}
                className="d-flex gap-2 align-items-center"
              >
                <HiOutlineBars3BottomLeft style={{ fontSize: "20px" }} />
                <TruncateText text={"Sample Chat Message " + (index + 1)} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <TbLayoutSidebarFilled
            style={{ height: "27px", width: "27px", cursor: "pointer", margin: "10px" }}
            onClick={() => setIsOpen(true)}
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;
