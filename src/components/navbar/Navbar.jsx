import React, { useContext, useState } from "react";
import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger Icon
import CloseIcon from "@mui/icons-material/Close"; // Close Icon
import Friends from "../../assets/2.png";
import Messages from "../../assets/10.png";
import Tutorials from "../../assets/11.png";
import Blogs from "../../assets/friend.png";
import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <div className="navbar">
        <div className="left">
          <div className="menuIcon" onClick={handleDrawerToggle}>
            <MenuIcon />
          </div>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span>MEDIA</span>
          </Link>
          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
          )}
          <div className="search">
            <SearchOutlinedIcon />
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        <div className="right">
          <NotificationsOutlinedIcon />
          <div className="user">
            {currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt="avatar" />
            ) : (
              <PersonOutlinedIcon className="defaultIcon" />
            )}
            <span>
              {currentUser?.username ||
                currentUser?.name ||
                currentUser?.email?.split("@")[0] ||
                "Guest"}
            </span>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="drawer">
          <div className="drawerHeader">
            <span>Menu</span>
            <CloseIcon className="closeIcon" onClick={handleDrawerToggle} />
          </div>
          <div className="drawerContent">
            <div className="user">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="profile" />
              ) : (
                <PersonOutlinedIcon className="defaultIcon" />
              )}
              <span>
                {currentUser?.username ||
                  currentUser?.name ||
                  currentUser?.email?.split("@")[0] ||
                  "Guest"}
              </span>
            </div>

            <hr />

            <div className="menu">
              <span>Your shortcuts</span>

              <div className="item clickable" onClick={() => {navigate("/connect"); handleDrawerToggle();}}>
                <img src={Friends} alt="friends" />
                <span>Connect</span>
              </div>

              <div className="item clickable" onClick={() => {navigate("/blogs"); handleDrawerToggle();}}>
                <img src={Blogs} alt="blogs" />
                <span>Blogs</span>
              </div>

              <div className="item clickable" onClick={() => {navigate("/generate"); handleDrawerToggle();}}>
                <img src={Tutorials} alt="generate" />
                <span>Generate Content</span>
              </div>

              <div className="item clickable" onClick={() => {navigate("/"); handleDrawerToggle();}}>
                <img src={Messages} alt="messages" />
                <span>Messages</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
