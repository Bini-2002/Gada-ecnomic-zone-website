import React, { useEffect, useState } from 'react';
import { getPost } from '../api';
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
      <p style={{fontSize:'1.15rem', lineHeight:1.7, whiteSpace:'pre-wrap'}}>{post.details}</p>
    </div>
  );
}
