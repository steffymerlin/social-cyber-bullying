import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext"; // Import AuthContext
import { db } from "../../firebase"; // Ensure db import is correct
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; // Necessary Firestore functions
import './User.scss'; // Importing the styles for the page

const Connect = () => {
  const { currentUser } = useContext(AuthContext); // Access currentUser from context
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Follow functionality
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

  // Unfollow functionality
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

  // Function to extract name from email if not found
  const getNameFromEmail = (email) => {
    return email.split("@")[0]; // Use the part before "@gmail.com"
  };

  // Function to choose the correct profile picture based on gender
  const getProfilePicture = (gender) => {
    if (gender === "male") {
      return "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png";
    } else if (gender === "female") {
      return "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359554_1280.png";
    }
    return "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"; // Default to male if gender is not provided
  };

  return (
    <div className="connectPage">
      <h1>Connect with Friends</h1>
      <p>Find and connect with people here!</p>

      <div className="userCards">
        {users.map(user => (
          <div className="userCard" key={user.id}>
            <div className="userCardContent">
              <img
                src={getProfilePicture(user.gender)} // Use gender-based profile picture
                alt="Profile"
                className="profilePic"
              />
              <div className="userInfo">
                <h4>{user.displayName || getNameFromEmail(user.email)}</h4>
                <p>{user.email}</p>
                <div className="followButtons">
                  {currentUser.following?.includes(user.id) ? (
                    <button className="unfollowButton" onClick={() => handleUnfollow(user.id)}>Unfollow</button>
                  ) : (
                    <button className="followButton" onClick={() => handleFollow(user.id)}>Follow</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connect;
