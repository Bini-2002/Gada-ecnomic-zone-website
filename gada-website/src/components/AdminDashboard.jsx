import React, { useState, useEffect } from "react";
import { createPost, getPosts } from "../api";
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
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const data = await getPosts();
        setLocalPosts(data);
      } catch (e) { setError(e.message); }
      finally { setLoadingPosts(false); }
    })();
  }, []);

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
    if (!(postTitle && postDate && postDetails && postImage)) return;
    const newPost = { title: postTitle, date: postDate, details: postDetails, image: postImage };
    try {
      const created = await createPost(newPost, token);
      setLocalPosts(p => [created, ...p]);
      // reset
      setPostTitle(""); setPostDate(""); setPostDetails(""); setPostImage(""); setImagePreview("");
      const input = document.getElementById('news-image-input'); if (input) input.value = '';
    } catch (e) {
      alert('Failed to create post: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`http://localhost:8000/posts/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Delete failed'); }
      setLocalPosts(p => p.filter(post => post.id !== id));
    } catch (e) { alert(e.message); }
  };

  const handleUpdate = async (id) => {
    const post = localPosts.find(p => p.id === id);
    if (!post) return;
    const title = prompt('Title', post.title) ?? post.title;
    const date = prompt('Date (YYYY-MM-DD)', post.date) ?? post.date;
    const details = prompt('Details', post.details) ?? post.details;
    const image = post.image; // keep existing (skip editing here)
    try {
      const res = await fetch(`http://localhost:8000/posts/${id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ title, date, details, image }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      setLocalPosts(p => p.map(x => x.id === id ? data : x));
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

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
          {loadingPosts && <div>Loading posts...</div>}
          {error && <div style={{color:'red'}}>{error}</div>}
          {localPosts.map((post) => (
            <div className="post-card" key={post.id}>
              <h3>{post.title}</h3>
              <div className="post-date">{post.date}</div>
              <p>{post.details}</p>
              {post.image && <img src={post.image} alt={post.title} style={{maxWidth:'100%',marginTop:'0.5rem',borderRadius:'0.5rem'}} />}
              <div style={{marginTop:'0.5rem',display:'flex',gap:'0.5rem'}}>
                <button type="button" onClick={() => handleUpdate(post.id)} className="approve-btn" style={{background:'#1976d2'}}>Edit</button>
                <button type="button" onClick={() => handleDelete(post.id)} className="approve-btn" style={{background:'#d32f2f'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
