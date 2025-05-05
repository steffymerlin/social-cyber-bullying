import "./posts.scss";
import Post from "../post/Post";
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase";
import { ref, onValue } from "firebase/database";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postRef = ref(rtdb, "posts");

    const unsubscribe = onValue(postRef, (snapshot) => {
      const data = snapshot.val();
      const loadedPosts = [];

      for (let id in data) {
        loadedPosts.push({ ...data[id], id });
      }

      setPosts(loadedPosts.reverse()); // latest first
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="posts">
      {posts.map((post) => (
        <Post post={post} key={post.id} postId={post.id} />
      ))}
    </div>
  );
};

export default Posts;
