import { useState } from "react";
import { loginUser, registerUser } from "../api";
import { API_BASE } from '../config';
async function resendVerification(username, password, setMessage) {
  const res = await fetch(`${API_BASE}/email/send-verification-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    setMessage('Verification email sent. Check your inbox for the 6-digit code.'); 
  } else {
    setMessage(data.detail || 'Failed to send verification');
  }
}
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
      if (res.detail === 'Account not yet approved') {
        setMessage('Your account is pending approval by an administrator.');
      } else if (res.detail === 'Email not verified') {
        setMessage('Email not verified. Please verify your email.');
      } else {
        setMessage(res.detail || "Login failed.");
      }
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
      {isLogin && message.includes('Email not verified') && (
        <div style={{marginTop:12,textAlign:'center'}}>
          <button onClick={()=>resendVerification(username, password, setMessage)}>Resend Verification Email</button>
          <div style={{marginTop:8}}>
            <button className="switch-link" onClick={()=>{ window.location.hash = '#verify-email'; }}>Enter verification code</button>
          </div>
        </div>
      )}
    </div>
  );
}
