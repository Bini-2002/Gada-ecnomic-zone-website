import React, { useState, useEffect } from "react";
import { createPost, getPosts, updatePost, listUsers, updateUserRole, deleteUser, uploadImage, approveUser, changePassword, deletePost, listInvestorProposals, updateInvestorProposalStatus } from "../api";
import { runPublishScheduled, backfillPostStatus } from "../api";
import "../AdminDashboard.css";

// Import newsData from News.jsx (if needed elsewhere)
import { newsData } from "./News.jsx";
import { API_BASE } from "../config";

function resolveImageUrl(img){
  if (!img) return img;
  if (typeof img === 'string' && img.startsWith('/uploads/')) return `${API_BASE}${img}`;
  return img;
}

export default function AdminDashboard() {
  const [postTitle, setPostTitle] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postDetails, setPostDetails] = useState("");
  const [postImage, setPostImage] = useState(""); // comma-separated URLs
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
  const [editStatus, setEditStatus] = useState('draft');
  const [editPublishAt, setEditPublishAt] = useState('');
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

  // Proposals state
  const [proposals, setProposals] = useState([]);
  const [proposalsTotal, setProposalsTotal] = useState(0);
  const [proposalSearch, setProposalSearch] = useState("");
  const [proposalStatusFilter, setProposalStatusFilter] = useState('all');
  const [proposalSectorFilter, setProposalSectorFilter] = useState("");
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState(null);

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

  // Load investor proposals
  useEffect(() => {
    let active = true;
    setProposalsLoading(true);
    (async () => {
      try {
        const data = await listInvestorProposals({ skip: 0, limit: 50, search: proposalSearch, status: proposalStatusFilter, sector: proposalSectorFilter }, token);
        if (!active) return;
        setProposals(data.items);
        setProposalsTotal(data.total);
      } catch (e) { if (active) setProposalsError(e.message); }
      finally { if (active) setProposalsLoading(false); }
    })();
    return () => { active = false; };
  }, [proposalSearch, proposalStatusFilter, proposalSectorFilter]);

  // Derived list of pending registrations from fetched users
  const pendingRegistrations = users.filter(u => !u.approved);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) { setPostImage(""); return; }
    try {
      const urls = [];
      for (const file of files) {
        const uploaded = await uploadImage(file, token);
        urls.push(uploaded.url);
      }
      setPostImage(urls.join(','));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
      setPostImage('');
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
      await deletePost(id, token);
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const urls = [];
      for (const file of files) {
        const uploaded = await uploadImage(file, token);
        urls.push(uploaded.url);
      }
      const existing = editImage ? editImage.split(/[;,\s]+/).filter(Boolean) : [];
      setEditImage([...existing, ...urls].join(','));
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
        <h2>Investor Proposals</h2>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.75rem'}}>
          <input type="text" placeholder="Search name/email/phone..." value={proposalSearch} onChange={e=>setProposalSearch(e.target.value)} className="post-input" style={{flex:1}} />
          <input type="text" placeholder="Filter by sector" value={proposalSectorFilter} onChange={e=>setProposalSectorFilter(e.target.value)} className="post-input" />
          <select value={proposalStatusFilter} onChange={e=>setProposalStatusFilter(e.target.value)} className="post-input">
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <div style={{marginLeft:'auto', fontWeight:600}}>Total: {proposalsTotal}</div>
        </div>
        {proposalsLoading && <div>Loading proposals...</div>}
        {proposalsError && <div style={{color:'red'}}>{proposalsError}</div>}
        {!proposalsLoading && proposals.length === 0 && <div>No proposals found.</div>}
        {proposals.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Proposal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.sector}</td>
                  <td>
                    <select value={p.status} onChange={async e=>{
                      try {
                        const updated = await updateInvestorProposalStatus(p.id, e.target.value, token);
                        setProposals(list => list.map(it => it.id === p.id ? updated : it));
                      } catch (err) { alert(err.message); }
                    }}>
                      <option value="submitted">submitted</option>
                      <option value="under_review">under_review</option>
                      <option value="accepted">accepted</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td>
                    {p.proposal_filename ? (
                      <a href={`${API_BASE}${p.proposal_filename}`} target="_blank" rel="noreferrer">Download PDF</a>
                    ) : '—'}
                  </td>
                  <td>
                    <button type="button" className="approve-btn" onClick={()=>{
                      try {
                        navigator.clipboard.writeText(`${p.name} | ${p.email} | ${p.phone} | ${p.sector}`);
                        alert('Copied contact summary');
                      } catch (_) {}
                    }}>Copy Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-section">
        <h2>Approve Registrations</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingRegistrations.map((u) => (
              <tr key={u.id} className={!u.approved ? "pending" : "approved"}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.approved ? 'approved' : 'pending'}</td>
                <td>
                  {!u.approved ? (
                    <button className="approve-btn" onClick={() => handleApproveChange(u.id, true)}>
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
            multiple
            onChange={handleImageChange}
            className="post-input"
            required
          />
          {postImage && (
            <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', marginTop:'0.5rem'}}>
              {postImage.split(/[;,\s]+/).filter(Boolean).map((u,i)=> (
                <img key={i} src={resolveImageUrl(u)} alt={`preview-${i}`} style={{maxWidth:'120px', borderRadius:'0.5rem', border:'2px solid #e53935'}} />
              ))}
            </div>
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
              <div style={{marginTop:'0.25rem'}}>
                <label style={{fontSize:'0.7rem', marginRight:'0.3rem'}}>Change status:</label>
                <select value={post.status} onChange={async e=>{ const newStatus = e.target.value; try { const updated = await updatePost(post.id, { title: post.title, date: post.date, details: post.details, image: post.image, status: newStatus, publish_at: post.publish_at || null }, token); setLocalPosts(p=>p.map(x=>x.id===post.id?updated:x)); } catch(err){ alert(err.message);} }} style={{fontSize:'0.7rem'}}>
                  <option value="draft">draft</option>
                  <option value="scheduled">scheduled</option>
                  <option value="published">published</option>
                </select>
              </div>
              <p>{post.details}</p>
              {post.image && (() => {
                const first = typeof post.image === 'string' ? (post.image.split(/[;,\s]+/).filter(Boolean)[0] || '') : post.image;
                return first ? <img src={resolveImageUrl(first)} alt={post.title} style={{maxWidth:'100%',marginTop:'0.5rem',borderRadius:'0.5rem'}} /> : null;
              })()}
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
              {editImage && <img src={resolveImageUrl(editImage)} alt="preview" style={{maxWidth:'160px', marginTop:'0.5rem', borderRadius:'0.5rem'}} />}
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
