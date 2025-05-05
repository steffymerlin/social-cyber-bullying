// src/pages/register/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./register.scss";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email,
        username,
        name,
        createdAt: new Date(),
      });
      toast.success("Registration successful 🎉");
      navigate("/");
    } catch (err) {
      toast.error("Registration failed 😢");
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Social Media.</h1>
          <p>
            Join now and start sharing your thoughts, photos, and more.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login"><button>Login</button></Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
            {/* <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required /> */}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
