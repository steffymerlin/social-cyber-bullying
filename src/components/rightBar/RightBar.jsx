import "./rightBar.scss";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (currentUser) {
      // Fetch all users except current user
      const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSuggestions(users);
      });

      // Fetch following list
      const userDoc = doc(db, "users", currentUser.uid);
      const unsubscribeFollowing = onSnapshot(userDoc, (docSnap) => {
        if (docSnap.exists()) {
          setFollowing(docSnap.data().following || []);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeFollowing();
      };
    }
  }, [currentUser]);

  const handleFollow = async (userId) => {
    const userRef = doc(db, "users", currentUser.uid);
    const followedUserRef = doc(db, "users", userId);

    // Update following for current user
    await updateDoc(userRef, {
      following: arrayUnion(userId),
    });

    // Update followers for the followed user
    await updateDoc(followedUserRef, {
      followers: arrayUnion(currentUser.uid),
    });
  };

  const handleUnfollow = async (userId) => {
    const userRef = doc(db, "users", currentUser.uid);
    const followedUserRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      following: arrayRemove(userId),
    });

    await updateDoc(followedUserRef, {
      followers: arrayRemove(currentUser.uid),
    });
  };

  return (
    <div className="rightBar">
      <div className="container">

        {/* Suggestions */}
        <div className="item">
          <span>Suggestions For You</span>
          {suggestions.map((user) => (
            <div className="user" key={user.uid}>
              <div className="userInfo">
                <img src={user.photoURL || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"} alt="" />
                <span>{user.displayName || user.email}</span>
              </div>
              <div className="buttons">
                {following.includes(user.uid) ? (
                  <button onClick={() => handleUnfollow(user.uid)}>Unfollow</button>
                ) : (
                  <button onClick={() => handleFollow(user.uid)}>Follow</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Latest Activities */}
        <div className="item">
          <span>Latest Activities</span>
          {/* Later you can fetch user recent posts from DB */}
          {suggestions.slice(0, 5).map((user) => (
            <div className="user" key={user.uid}>
              <div className="userInfo">
                <img src={user.photoURL || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"} alt="" />
                <p>
                  <span>{user.displayName || user.email}</span> joined recently
                </p>
              </div>
              <span>New</span>
            </div>
          ))}
        </div>

        {/* Online Friends */}
        <div className="item">
          <span>Online Friends</span>
          {suggestions
            .filter((user) => following.includes(user.uid))
            .map((user) => (
              <div className="user" key={user.uid}>
                <div className="userInfo">
                  <img src={user.photoURL || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"} alt="" />
                  <div className="online" />
                  <span>{user.displayName || user.email}</span>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default RightBar;
