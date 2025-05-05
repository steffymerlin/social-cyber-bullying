// --- Full Combined Code: Firebase Setup + Stories Component ---

import { useContext, useEffect, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCnrIKTmTDGStta3m42jnmJb4wiFUpsgmc",
  authDomain: "code-8132b.firebaseapp.com",
  projectId: "code-8132b",
  storageBucket: "code-8132b.appspot.com",
  messagingSenderId: "334925491682",
  appId: "1:334925491682:web:f4eb698a3692a6e6a45dbb",
  measurementId: "G-MKRFSDC10Y"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const rtdb = getDatabase(app);
const storage = getStorage(app);

// --- Stories Component ---
const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAddStory = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const storagePath = `stories/${currentUser.uid}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        const storyRef = ref(rtdb, "stories");
        const storyData = {
          userId: currentUser.uid,
          username: currentUser.name,
          profilePic: currentUser.profilePic,
          storyImg: downloadURL,
          createdAt: Date.now(),
        };
        await push(storyRef, storyData);
        setImagePreview(null);
        setUploading(false);
      }
    );
  };

  useEffect(() => {
    const storyRef = ref(rtdb, "stories");

    const unsubscribe = onValue(storyRef, (snapshot) => {
      const data = snapshot.val();
      const now = Date.now();
      const validStories = [];

      if (data) {
        Object.entries(data).forEach(([id, value]) => {
          if (now - value.createdAt <= 12 * 60 * 60 * 1000) {
            validStories.push({ id, ...value });
          } else {
            remove(ref(rtdb, `stories/${id}`));
          }
        });

        validStories.sort((a, b) => b.createdAt - a.createdAt);
      }

      setStories(validStories);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="stories">
      <div className="story">
        <span>{currentUser.name}</span>
        <label htmlFor="storyUpload" className="addBtn">+</label>
        <input
          type="file"
          id="storyUpload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAddStory}
        />
      </div>

      {uploading && imagePreview && (
        <div className="story-preview">
          <img src={imagePreview} alt="Uploading Preview" />
          <p>Uploading your story...</p>
        </div>
      )}

      <div className="story-list">
        {stories.map((story) => (
          <div className="story" key={story.id}>
            <img src={story.storyImg} alt={story.username} />
            <span>{story.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
