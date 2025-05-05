import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5eU-v6APwx7JBbhcT1-expFiDmFLCvpY",
  authDomain: "social-4b64d.firebaseapp.com",
  databaseURL: "https://social-4b64d-default-rtdb.firebaseio.com",
  projectId: "social-4b64d",
  storageBucket: "social-4b64d.appspot.com",
  messagingSenderId: "256157601511",
  appId: "1:256157601511:web:12d79a05326a81a88fdc42",
  measurementId: "G-9CE89LLX68"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
