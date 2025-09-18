import React, { useState } from 'react';
import { performPasswordReset } from '../api';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (password !== confirm) { setMsg('Passwords do not match'); setStatus('error'); return; }
    if (!token) { setMsg('Token is required'); setStatus('error'); return; }
    setStatus('loading');
    try {
      const res = await performPasswordReset({ token: token.trim(), new_password: password });
      setMsg(res.detail || 'Password reset successful');
      setStatus('success');
    } catch (err) {
      setMsg(err.message || 'Reset failed');
      setStatus('error');
    }
  };

  return (
    <div className="login-register-container">
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <label>Reset Token</label>
        <input type="text" value={token} onChange={e=>setToken(e.target.value)} required />
        <label>New Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label>Confirm New Password</label>
        <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        <button type="submit" disabled={status==='loading'}>Reset Password</button>
        {msg && <div className={`message ${status==='success'?'success':'error'}`}>{msg}</div>}
      </form>
      <div style={{marginTop:16,textAlign:'center'}}>
        <button className="switch-link" onClick={()=>{ window.location.hash = '#log-in'; }}>Back to login</button>
      </div>
    </div>
  );
}
