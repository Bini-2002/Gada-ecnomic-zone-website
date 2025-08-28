import React, { useState } from 'react';
import { verifyEmail } from '../api';

export default function VerifyEmail() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await verifyEmail({ token: code.trim(), username: username.trim() || undefined, email: email.trim() || undefined });
      setMsg(res.detail || 'Verified');
    } catch (err) {
      setMsg(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem'}}>
      <h2>Verify your email</h2>
      <p>Enter the 6-digit code you received by email. You can optionally fill your username or email to help match your account.</p>
      <form onSubmit={onSubmit} style={{display:'grid', gap:'0.6rem'}}>
        <input type="text" placeholder="Username (optional)" value={username} onChange={e=>setUsername(e.target.value)} style={{padding:'0.6rem'}} />
        <input type="email" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:'0.6rem'}} />
        <input type="text" inputMode="numeric" placeholder="Verification code" value={code} onChange={e=>setCode(e.target.value)} required style={{padding:'0.6rem'}} />
        <button type="submit" disabled={loading} style={{padding:'0.6rem 1rem'}}>{loading ? 'Verifying…' : 'Verify'}</button>
      </form>
      {msg && <div style={{marginTop:'0.75rem', fontWeight:600}}>{msg}</div>}
    </div>
  );
}
