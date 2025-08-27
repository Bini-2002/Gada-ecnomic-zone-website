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
      <div style={{display:'flex', gap:'0.5rem', alignItems:'center', margin:'0.5rem 0 0.75rem'}}>
        <button onClick={async()=>{ try { const s = await toggleLike(postId); setLikes(s);} catch(e){ alert(e.message);} }} style={{padding:'0.3rem 0.6rem'}}>👍 {likes.liked ? 'Unlike' : 'Like'} ({likes.likes_count})</button>
        <button onClick={async()=>{
          const shareData = { title: post.title, text: post.details.slice(0,120), url: window.location.href };
          if (navigator.share) { try { await navigator.share(shareData); } catch(_){} }
          else { navigator.clipboard?.writeText(shareData.url); alert('Link copied to clipboard'); }
        }} style={{padding:'0.3rem 0.6rem'}}>🔗 Share</button>
      </div>
      <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap', margin:'0.75rem 0'}}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`image-${i}`} style={{maxWidth:'100%', width:'calc(50% - 0.75rem)', borderRadius:'0.5rem'}} />
        ))}
      </div>
      <p style={{fontSize:'1.15rem', lineHeight:1.7, whiteSpace:'pre-wrap'}}>{post.details}</p>

      <div style={{marginTop:'1.25rem'}}>
        <h3>Comments</h3>
        <form onSubmit={async e => { e.preventDefault(); const text = commentText.trim(); if (!text) return; try { const c = await addComment(postId, text); setComments(prev => [...prev, c]); setCommentText(''); } catch (err) { alert(err.message); } }} style={{display:'flex', gap:'0.5rem', marginBottom:'0.75rem'}}>
          <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Write a comment..." style={{flex:1, padding:'0.5rem 0.7rem'}} />
          <button type="submit">Post</button>
        </form>
        <div>
          {comments.map(c => (
            <div key={c.id} style={{padding:'0.5rem 0', borderBottom:'1px solid #eee'}}>
              <div style={{fontSize:'0.85rem', opacity:0.7}}>#{c.user_id} • {new Date(c.created_at).toLocaleString()}</div>
              <div style={{whiteSpace:'pre-wrap'}}>{c.content}</div>
              <button onClick={async()=>{ try { await deleteCommentApi(postId, c.id); setComments(prev => prev.filter(x => x.id !== c.id)); } catch (err) { alert(err.message); } }} style={{background:'transparent', color:'#d32f2f', border:'none', padding:0, cursor:'pointer'}}>Delete</button>
            </div>
          ))}
          {comments.length === 0 && <div>No comments yet.</div>}
        </div>
      </div>
    </div>
  );
}
