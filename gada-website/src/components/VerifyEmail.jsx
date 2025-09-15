import React, { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../api';
import '../VerifyEmail.css';

export default function VerifyEmail() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const codeRef = useRef(null);

  useEffect(() => { codeRef.current?.focus(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const cleaned = (code || '').replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) { setMsg('Please enter the 6-digit code.'); setStatus('error'); return; }
    setStatus('loading');
    try {
      const res = await verifyEmail({ token: cleaned, username: username.trim() || undefined, email: email.trim() || undefined });
      setMsg(res.detail || 'Verified');
      setStatus('success');
    } catch (err) {
      setMsg(err.message || 'Failed');
      setStatus('error');
    }
  };

  const onCodeChange = (v) => {
    // Only digits, max 6. Support paste.
    const cleaned = v.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  return (
    <div className="verify-wrap">
      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-icon">✉️</div>
          <h2>Email Verification</h2>
          <p>Enter the 6-digit code we sent to your email. Optionally add your username or email.</p>
        </div>

        <form className="verify-form" onSubmit={onSubmit}>
          <div className="verify-fields" style={{gridTemplateColumns:'1fr'}}>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={e=>onCodeChange(e.target.value)}
              className="code-input code-input--full"
              aria-label="6-digit verification code"
              maxLength={6}
              required
            />
          </div>

          <div className="verify-fields">
            <input type="text" placeholder="Username (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
            <input type="email" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <button type="submit" className="verify-btn" disabled={status==='loading'}>
            {status==='loading' ? 'Verifying…' : 'Verify'}
          </button>

          {msg && (
            <div className={`verify-msg ${status}`}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
