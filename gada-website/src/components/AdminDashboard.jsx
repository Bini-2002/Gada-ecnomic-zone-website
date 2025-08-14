import React, { useState } from "react";
import { registerUser, loginUser } from "../api";
import "../AdminDashboard.css";

// Import newsData from News.jsx
import { newsData } from "./News.jsx";

const dummyRegistrations = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "pending" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "pending" },
];

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState(dummyRegistrations);
  const [postTitle, setPostTitle] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postDetails, setPostDetails] = useState("");
  const [postImage, setPostImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [localPosts, setLocalPosts] = useState([]);


  // Example: Register an admin (for demo, replace with your own logic/UI)
  const handleAdminRegister = async () => {
    const res = await registerUser({ username: "admin", password: "adminpass", role: "admin" });
    alert("Admin registered: " + JSON.stringify(res));
  };

  // Example: Login as admin (for demo, replace with your own logic/UI)
  const handleAdminLogin = async () => {
    const res = await loginUser({ username: "admin", password: "adminpass" });
    if (res.access_token) {
      localStorage.setItem("token", res.access_token);
      alert("Logged in as admin!");
    } else {
      alert("Login failed: " + JSON.stringify(res));
    }
  };

  // Approve registration (dummy, replace with backend call if needed)
  const approveRegistration = (id) => {
    setRegistrations((regs) =>
      regs.map((reg) =>
        reg.id === id ? { ...reg, status: "approved" } : reg
      )
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPostImage("");
      setImagePreview("");
    }
  };

  // Create post as admin (calls backend, requires JWT)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (postTitle && postDate && postDetails && postImage) {
      const token = localStorage.getItem("token");
      const newPost = {
        title: postTitle,
        date: postDate,
        details: postDetails,
        image: postImage,
      };
      // Call backend (replace URL if needed)
      const res = await fetch("http://localhost:8000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalPosts([data, ...localPosts]);
        alert("Post created!");
      } else {
        alert("Failed to create post: " + JSON.stringify(data));
      }
      setPostTitle("");
      setPostDate("");
      setPostDetails("");
      setPostImage("");
      setImagePreview("");
      if (document.getElementById('news-image-input')) {
        document.getElementById('news-image-input').value = "";
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      <div style={{marginBottom:16}}>
        <button onClick={handleAdminRegister}>Register Admin (demo)</button>
        <button onClick={handleAdminLogin} style={{marginLeft:8}}>Login as Admin (demo)</button>
      </div>
      <div className="admin-section">
        <h2>Approve Registrations</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id} className={reg.status === "approved" ? "approved" : "pending"}>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.status}</td>
                <td>
                  {reg.status === "pending" ? (
                    <button className="approve-btn" onClick={() => approveRegistration(reg.id)}>
                      Approve
                    </button>
                  ) : (
                    <span className="approved-label">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-section">
        <h2>Create Post</h2>
        <form className="post-form" onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Post Title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="post-input"
            required
          />
          <input
            type="date"
            placeholder="Date"
            value={postDate}
            onChange={(e) => setPostDate(e.target.value)}
            className="post-input"
            required
          />
          <textarea
            placeholder="Details"
            value={postDetails}
            onChange={(e) => setPostDetails(e.target.value)}
            className="post-textarea"
            required
          />
          <input
            id="news-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="post-input"
            required
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{maxWidth:'180px',marginTop:'0.5rem',borderRadius:'0.5rem',border:'2px solid #e53935'}} />
          )}
          <button type="submit" className="create-post-btn">Create Post</button>
        </form>
        <div className="posts-list">
          {localPosts.map((post, idx) => (
            <div className="post-card" key={idx}>
              <h3>{post.title}</h3>
              <div className="post-date">{post.date}</div>
              <p>{post.details}</p>
              {post.image && <img src={post.image} alt={post.title} style={{maxWidth:'100%',marginTop:'0.5rem',borderRadius:'0.5rem'}} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
