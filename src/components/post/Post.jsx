import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import { rtdb } from "../../firebase";
import { ref, update } from "firebase/database";

const Post = ({ post, postId }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const newLikes = liked ? post.likes - 1 : post.likes + 1;
    setLiked(!liked);

    const postRef = ref(rtdb, `posts/${postId}`);
    await update(postRef, {
      likes: newLikes,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Post",
          text: post.desc,
          url: post.img || window.location.href,
        });
      } catch (error) {
        console.error("Sharing failed", error);
      }
    } else {
      alert("Your browser does not support share feature.");
    }
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profilePic || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"} alt="User" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>

        <div className="content">
          <p>{post.desc}</p>
          {post.place && <p><strong>📍 Place:</strong> {post.place}</p>}
          {post.taggedFriends && <p><strong>👥 With:</strong> {post.taggedFriends}</p>}
          {post.img && (
            <img src={post.img} alt="Post" style={{ width: "100%", marginTop: "10px", borderRadius: "10px" }} />
          )}
        </div>

        <div className="info">
          <div className="item" onClick={handleLike}>
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {post.likes} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {post.comments} Comments
          </div>
          <div className="item" onClick={handleShare}>
            <ShareOutlinedIcon />
            Share
          </div>
        </div>

        {commentOpen && <Comments postId={postId} />}
      </div>
    </div>
  );
};

export default Post;
