import "./leftBar.scss";
import Friends from "../../assets/2.png";
import Messages from "../../assets/10.png";
import Tutorials from "../../assets/11.png";
import Blogs from "../../assets/friend.png"
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { AuthContext } from "../../context/authContext";

const LeftBar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
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
        </div>

        <hr />

        <div className="menu">
          <span>Your shortcuts</span>

          <div className="item clickable" onClick={() => navigate("/connect")}>
  <img src={Friends} alt="friends" />
  <span>Connect</span>
</div>

          <div className="item clickable" onClick={() => navigate("/blogs")}>
  <img src={Blogs} alt="blogs" />
  <span>Blogs</span>
</div>

          <div
            className="item clickable"
            onClick={() => navigate("/generate")}
          >
            <img src={Tutorials} alt="generate" />
            <span>Generate Content</span>
          </div>

          <div  className="item clickable"
            onClick={() => navigate("/")}>
            <img src={Messages} alt="messages" />
            <span>Messages</span>
          </div>
        </div>

        <hr />
      </div>
    </div>
  );
};

export default LeftBar;
