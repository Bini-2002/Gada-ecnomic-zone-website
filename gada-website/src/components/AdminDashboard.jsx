import React, { useState, useEffect } from "react";
import { createPost, getPosts, updatePost, listUsers, updateUserRole, deleteUser, uploadImage, approveUser, changePassword } from "../api";
import { runPublishScheduled, backfillPostStatus } from "../api";
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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userSkip, setUserSkip] = useState(0);
  const [userHasMore, setUserHasMore] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [postStatus, setPostStatus] = useState('draft');
  const [postPublishAt, setPostPublishAt] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortMode, setSortMode] = useState('created_desc');
  const [postsTotal, setPostsTotal] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const data = await getPosts({ status: filterStatus, sort: mapSort(sortMode) });
        setLocalPosts(data.items);
        setPostsTotal(data.total);
      } catch (e) { setError(e.message); }
      finally { setLoadingPosts(false); }
    })();
  }, [filterStatus, sortMode]);

  function mapSort(mode){
    switch(mode){
      case 'created_asc': return 'created_asc';
      case 'publish_at_asc': return 'publish_at_asc';
      case 'publish_at_desc': return 'publish_at_desc';
      default: return undefined; // created_desc default
    }
  }

  // Load users
  useEffect(() => {
    let active = true;
    setUsersLoading(true);
    (async () => {
      try {
        const data = await listUsers({ skip: 0, limit: 25, search: userSearch }, token);
        if (!active) return;
        setUsers(data.items);
        setUserSkip(data.items.length);
        setUserHasMore(data.items.length === 25);
      } catch (e) { if (active) setUsersError(e.message); }
      finally { if (active) setUsersLoading(false); }
    })();
    return () => { active = false; };
  }, [userSearch]);

  // Approve registration (dummy, replace with backend call if needed)
  const approveRegistration = (id) => {
    setRegistrations((regs) =>
      regs.map((reg) =>
        reg.id === id ? { ...reg, status: "approved" } : reg
      )
    );
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      try {
        const uploaded = await uploadImage(file, token);
        setPostImage(uploaded.url); // store URL path
      } catch (err) {
        alert('Image upload failed: ' + err.message);
        setPostImage('');
        setImagePreview('');
      }
    } else {
      setPostImage("");
      setImagePreview("");
    }
  };

  // Create post as admin (calls backend, requires JWT)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!(postTitle && postDate && postDetails && postImage)) return;
    const newPost = { title: postTitle, date: postDate, details: postDetails, image: postImage, status: postStatus, publish_at: postPublishAt || null };
    try {
      const created = await createPost(newPost, token);
      setLocalPosts(p => [created, ...p]);
      setPostsTotal(t=>t+1);
      // reset
      setPostTitle(""); setPostDate(""); setPostDetails(""); setPostImage(""); setImagePreview(""); setPostStatus('draft'); setPostPublishAt('');
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
      setPostsTotal(t=>t-1);
    } catch (e) { alert(e.message); }
  };

  const loadMoreUsers = async () => {
    if (!userHasMore) return;
    try {
      const batch = await listUsers({ skip: userSkip, limit: 25, search: userSearch }, token);
      setUsers(u => [...u, ...batch.items]);
      setUserSkip(s => s + batch.items.length);
      setUserHasMore(batch.items.length === 25);
    } catch (e) { alert(e.message); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await updateUserRole(userId, newRole, token);
      setUsers(u => u.map(us => us.id === userId ? updated : us));
    } catch (e) { alert(e.message); }
  };
  const handleApproveChange = async (userId, approved) => {
    try {
      const updated = await approveUser(userId, approved, token);
      setUsers(u => u.map(us => us.id === userId ? updated : us));
    } catch (e) { alert(e.message); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(userId, token);
      setUsers(u => u.filter(us => us.id !== userId));
    } catch (e) { alert(e.message); }
  };

  const openEditPost = (post) => {
    setEditId(post.id);
    setEditTitle(post.title);
    setEditDate(post.date);
    setEditDetails(post.details);
    setEditImage(post.image);
    setEditStatus(post.status || 'draft');
    setEditPublishAt(post.publish_at ? post.publish_at.slice(0,16) : '');
    setEditModalOpen(true);
  };
  const closeEditModal = () => { if (!savingEdit) setEditModalOpen(false); };
  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploaded = await uploadImage(file, token);
      setEditImage(uploaded.url);
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    }
  };
  const saveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updated = await updatePost(editId, { title: editTitle, date: editDate, details: editDetails, image: editImage, status: editStatus, publish_at: editPublishAt || null }, token);
      setLocalPosts(p => p.map(x => x.id === editId ? updated : x));
    } catch (e) { alert(e.message); }
    finally { setSavingEdit(false); }
  };

  // Replace old prompt edit trigger
  const handleUpdate = (id) => {
    const post = localPosts.find(p => p.id === id);
    if (post) openEditPost(post);
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
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.75rem'}}>
          <div>Filter:
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{marginLeft:'0.3rem'}}>
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>Sort:
            <select value={sortMode} onChange={e=>setSortMode(e.target.value)} style={{marginLeft:'0.3rem'}}>
              <option value="created_desc">Newest</option>
              <option value="created_asc">Oldest</option>
              <option value="publish_at_asc">Publish Time Asc</option>
              <option value="publish_at_desc">Publish Time Desc</option>
            </select>
          </div>
          <div style={{display:'flex', gap:'0.4rem'}}>
            <button type="button" className="approve-btn" style={{background:'#6a1b9a'}} onClick={async()=>{ try { const r = await runPublishScheduled(token); alert(`Published ${r.updated} posts`); reloadPosts(); } catch(e){ alert(e.message);} }}>Run Publish</button>
            <button type="button" className="approve-btn" style={{background:'#455a64'}} onClick={async()=>{ if(!window.confirm('Backfill null statuses?')) return; try { const r = await backfillPostStatus(token); alert(`Backfilled ${r.updated}`); reloadPosts(); } catch(e){ alert(e.message);} }}>Backfill Status</button>
          </div>
          <div style={{marginLeft:'auto', fontWeight:600}}>Total: {postsTotal}</div>
        </div>
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
          <select value={postStatus} onChange={e=>setPostStatus(e.target.value)} className="post-input" required>
            <option value="draft">Draft</option>
            <option value="published">Publish Now</option>
            <option value="scheduled">Scheduled</option>
          </select>
          {postStatus === 'scheduled' && (
            <input type="datetime-local" value={postPublishAt} onChange={e=>setPostPublishAt(e.target.value)} className="post-input" />
          )}
          <button type="submit" className="create-post-btn">Create Post</button>
        </form>
        <div className="posts-list">
          {loadingPosts && <div>Loading posts...</div>}
          {error && <div style={{color:'red'}}>{error}</div>}
          {localPosts.map((post) => (
            <div className="post-card" key={post.id}>
              <h3>{post.title}</h3>
              <div className="post-date">{post.date} <span style={{fontSize:'0.75rem', padding:'0.15rem 0.4rem', borderRadius:'0.4rem', background:'#eee', marginLeft:'0.5rem'}}>{post.status}</span></div>
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
      <div className="admin-section">
        <h2>User Management</h2>
        <div style={{display:'flex', gap:'0.5rem', marginBottom:'0.75rem'}}>
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="post-input"
            style={{flex:1}}
          />
          <button className="approve-btn" type="button" onClick={() => setUserSearch(s => s)}>Search</button>
        </div>
        {usersLoading && <div>Loading users...</div>}
        {usersError && <div style={{color:'red'}}>{usersError}</div>}
        {!usersLoading && users.length === 0 && <div>No users found.</div>}
        {users.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{padding:'0.3rem', borderRadius:'0.4rem'}}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <input type="checkbox" checked={!!u.approved} onChange={e => handleApproveChange(u.id, e.target.checked)} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="approve-btn"
                      style={{background:'#555'}}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {userHasMore && !usersLoading && (
          <button className="approve-btn" type="button" onClick={loadMoreUsers}>Load More</button>
        )}
      </div>
      <div className="admin-section">
        <h2>Change My Password</h2>
        <form onSubmit={async e => { e.preventDefault(); setPasswordMsg(''); try { const res = await changePassword(passwordOld, passwordNew, token); setPasswordMsg(res.detail); setPasswordOld(''); setPasswordNew(''); } catch (err) { setPasswordMsg(err.message); } }} className="post-form" style={{marginBottom:'0.5rem'}}>
          <input type="password" placeholder="Old Password" value={passwordOld} onChange={e=>setPasswordOld(e.target.value)} className="post-input" required />
          <input type="password" placeholder="New Password" value={passwordNew} onChange={e=>setPasswordNew(e.target.value)} className="post-input" required />
          <button type="submit" className="create-post-btn">Update Password</button>
        </form>
        {passwordMsg && <div style={{fontWeight:600}}>{passwordMsg}</div>}
      </div>

      {/* Edit Post Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onMouseDown={closeEditModal}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <h3>Edit Post</h3>
            <form onSubmit={saveEdit} className="modal-form">
              <input className="post-input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} required />
              <input className="post-input" type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} required />
              <textarea className="post-textarea" value={editDetails} onChange={e=>setEditDetails(e.target.value)} required />
              <input type="file" accept="image/*" onChange={handleEditImageChange} />
              {editImage && <img src={editImage} alt="preview" style={{maxWidth:'160px', marginTop:'0.5rem', borderRadius:'0.5rem'}} />}
              <select className="post-input" value={editStatus} onChange={e=>setEditStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
              {editStatus === 'scheduled' && (
                <input type="datetime-local" className="post-input" value={editPublishAt} onChange={e=>setEditPublishAt(e.target.value)} />
              )}
              <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'0.75rem'}}>
                <button type="button" disabled={savingEdit} onClick={closeEditModal} className="approve-btn" style={{background:'#777'}}>Cancel</button>
                <button type="submit" disabled={savingEdit} className="approve-btn" style={{background:'#1976d2'}}>{savingEdit ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// helper to reload posts after task
function reloadPosts(){ /* intentionally left; component uses effect on filter/sort state */ }
