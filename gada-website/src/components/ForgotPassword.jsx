import React, { useState } from 'react';
import { requestPasswordReset } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle'); // idle|loading|success|error
  const [devToken, setDevToken] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setDevToken(''); setStatus('loading');
    try {
      const res = await requestPasswordReset(email.trim());
      setMsg(res.detail || 'If that email exists, a reset was created.');
      if (res.token) setDevToken(res.token); // dev convenience
      setStatus('success');
    } catch (err) {
      setMsg(err.message || 'Request failed');
      setStatus('error');
    }
  };

  return (
    <div className="login-register-container">
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button type="submit" disabled={status==='loading'}>Send Reset Link</button>
        {msg && <div className={`message ${status==='success'?'success':'error'}`}>{msg}</div>}
        {devToken && (
          <div className="message" style={{marginTop:8}}>
            Dev token: <code style={{wordBreak:'break-all'}}>{devToken}</code>
          </div>
        )}
      </form>
      <div style={{marginTop:16,textAlign:'center'}}>
        <button className="switch-link" onClick={()=>{ window.location.hash = '#reset-password'; }}>Have a token? Reset now</button>
      </div>
    </div>
  );
}
