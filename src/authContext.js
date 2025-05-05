import { createContext, useEffect, useState } from "react";
import { auth, rtdb } from "../firebase"; // ✅ correct
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database"; // ✅ not firestore!

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(rtdb, `users/${user.uid}`); // ✅ correct path  
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...snapshot.val(),
          });
        } else {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
