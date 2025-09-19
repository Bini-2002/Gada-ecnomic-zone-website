import React, { useEffect, useState } from 'react';
import { getPost, listComments, addComment, deleteCommentApi, getLikeStatus, toggleLike } from '../api';
import { API_BASE } from '../config';
import '../News.css';

function resolveImageUrl(img){
  if (!img) return img;
  if (typeof img === 'string' && img.startsWith('/uploads/')) return `${API_BASE}${img}`;
  return img;
}

export default function NewsFeed({ postId, onBack }){
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState({ liked: false, likes_count: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPost(postId);
        if (!active) return;
        setPost(data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [postId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cs, ls] = await Promise.all([
          listComments(postId, { skip: 0, limit: 100 }),
          getLikeStatus(postId)
        ]);
        if (!active) return;
        setComments(cs.items || []);
        setLikes(ls);
      } catch (_) { /* ignore initial */ }
    })();
    return () => { active = false; };
  }, [postId]);

  if (loading) return <div className="news-loading">Loading...</div>;
  if (error) return <div className="news-error">{error}</div>;
  if (!post) return null;

  const images = (post.image || '')
    .split(/[;,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(resolveImageUrl);

  return (
    <div className="news-detail-container" style={{maxWidth: '980px', margin: '0 auto'}}>
      <button onClick={onBack} style={{margin:'0.75rem 0', padding:'0.4rem 0.8rem', borderRadius:'0.4rem', border:'1px solid #ccc'}}>← Back</button>
      <h1 className="news-card-title" style={{fontSize:'2rem'}}>{post.title}</h1>
      <div className="news-card-date" style={{fontSize:'1.1rem'}}>{post.date}</div>
      <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap', margin:'0.75rem 0'}}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`image-${i}`} style={{maxWidth:'100%', width:'calc(50% - 0.75rem)', borderRadius:'0.5rem'}} />
        ))}
      </div>
      <div className="news-actions">
        <button
          className={`action-btn like-btn ${likes.liked ? 'liked' : ''}`}
          onClick={async () => {
            try { const s = await toggleLike(postId); setLikes(s);} catch (e) { alert(e.message); }
          }}
        >
          <span className="icon">👍</span>
          <span>{likes.liked ? 'Liked' : 'Like'}</span>
          <span className="count">({likes.likes_count})</span>
        </button>
        <button
          className="action-btn share-btn"
          onClick={async () => {
            const shareData = { title: post.title, text: post.details.slice(0,120), url: window.location.href };
            if (navigator.share) { try { await navigator.share(shareData); } catch(_){} }
            else { navigator.clipboard?.writeText(shareData.url); alert('Link copied to clipboard'); }
          }}
        >
          <span className="icon">🔗</span>
          <span>Share</span>
        </button>
      </div>
      <p style={{fontSize:'1.15rem', lineHeight:1.7, whiteSpace:'pre-wrap'}}>{post.details}</p>

      <div className="comments-section">
        <h3 className="comments-title">Comments</h3>
        <form
          className="comment-form"
          onSubmit={async e => {
            e.preventDefault();
            const text = commentText.trim();
            if (!text) return;
            try {
              const c = await addComment(postId, text);
              setComments(prev => [...prev, c]);
              setCommentText('');
            } catch (err) { alert(err.message); }
          }}
        >
          <input
            className="comment-input"
            value={commentText}
            onChange={e=>setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit" className="comment-submit">Post</button>
        </form>
        <div className="comment-list">
          {comments.map(c => {
            const displayName = (c.user && (c.user.full_name || c.user.username || c.user.name)) || c.full_name || c.username || c.user_name || `User #${c.user_id}`;
            const initial = (displayName || '?').toString().trim().charAt(0).toUpperCase() || '?';
            return (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar" aria-hidden>{initial}</div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-username">{displayName}</span>
                    <span className="comment-date">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div className="comment-content">{c.content}</div>
                  <div className="comment-actions">
                    <button
                      className="comment-delete"
                      onClick={async()=>{
                        try { await deleteCommentApi(postId, c.id); setComments(prev => prev.filter(x => x.id !== c.id)); }
                        catch (err) { alert(err.message); }
                      }}
                    >Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {comments.length === 0 && <div className="no-comments">No comments yet.</div>}
        </div>
      </div>
    </div>
  );
}
