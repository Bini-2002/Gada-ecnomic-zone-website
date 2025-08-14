import { useState } from "react";
import { loginUser, registerUser } from "../api";
import "../LoginRegisterPage.css";

export default function LoginRegisterPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await loginUser({ username, password });
    if (res.access_token) {
      localStorage.setItem("token", res.access_token);
      setMessage("Login successful!");
      if (onLogin) onLogin();
    } else {
      setMessage(res.detail || "Login failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!username || !email) {
      setMessage("Username and email are required.");
      return;
    }
    const res = await registerUser({ username, email, password, role: "user" });
    if (res.id) {
      setMessage("Registration successful! You can now log in.");
      setIsLogin(true);
    } else {
      setMessage(res.detail || "Registration failed.");
    }
  };

  return (
    <div className="login-register-container">
      <h2>{isLogin ? "Log In" : "Register"}</h2>
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        <label>Username</label>
        <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required />
        {!isLogin && <>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </>}
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {!isLogin && <>
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
        </>}
        <button type="submit">{isLogin ? "Log In" : "Register"}</button>
        {message && <div className={`message${message.includes('success') ? ' success' : ' error'}`}>{message}</div>}
      </form>
      <div style={{marginTop:16,textAlign:"center"}}>
        {isLogin ? (
          <span>Don't have an account? <button className="switch-link" onClick={()=>setIsLogin(false)}>Register</button></span>
        ) : (
          <span>Already have an account? <button className="switch-link" onClick={()=>setIsLogin(true)}>Log In</button></span>
        )}
      </div>
    </div>
  );
}
