import "./share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { rtdb, storage } from "../../firebase";
import { ref, push } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Share = () => {
  const { currentUser } = useContext(AuthContext);

  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [place, setPlace] = useState("");
  const [taggedFriends, setTaggedFriends] = useState("");

  useEffect(() => {
    // Load preview from localStorage if available
    const storedPreview = localStorage.getItem("shareImagePreview");
    if (storedPreview) {
      setPreview(storedPreview);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      localStorage.setItem("shareImagePreview", objectUrl); // Save to localStorage
    }
  };

  const handleShare = async () => {
    if (!desc && !file && !place && !taggedFriends) {
      alert("Please add something to share!");
      return;
    }

    try {
      let imgUrl = "";

      if (file) {
        const storageReference = storageRef(storage, `posts/${currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              imgUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      const newPost = {
        userId: currentUser.uid,
        name: currentUser.cName || currentUser.name || currentUser.email,
        profilePic: currentUser.profilePic || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png",
        desc,
        img: imgUrl,
        place,
        taggedFriends,
        likes: 0,
        comments: 0,
        createdAt: Date.now(),
      };

      const postRef = ref(rtdb, "posts");
      await push(postRef, newPost);

      // Reset form
      setDesc("");
      setFile(null);
      setPreview(null);
      setPlace("");
      setTaggedFriends("");
      document.getElementById("file").value = "";
      localStorage.removeItem("shareImagePreview"); // Remove preview from localStorage after sharing

      alert("Post Shared Successfully! 🎉");
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Failed to share post. Please try again.");
    }
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser?.profilePic || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"} alt="Profile" />
          <input
            type="text"
            placeholder={`What's on your mind ${currentUser?.cName || currentUser?.name || "User"}?`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" style={{ width: "95%", height: "60%", marginTop: "10px", borderRadius: "10px" }} />
          </div>
        )}

        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="Add" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="Add Place" />
              <span>Add Place </span>
            </div>
            <div className="item">
              <img src={Friend} alt="Tag Friends" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleShare}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
