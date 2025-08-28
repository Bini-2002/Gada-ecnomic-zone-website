import React, { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../api';
import '../VerifyEmail.css';

export default function VerifyEmail() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const inputsRef = useRef([]);

  useEffect(() => {
    // focus first input on mount
    inputsRef.current?.[0]?.focus();
  }, []);

  const code = codeDigits.join('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setStatus('loading');
    try {
      const res = await verifyEmail({ token: code.trim(), username: username.trim() || undefined, email: email.trim() || undefined });
      setMsg(res.detail || 'Verified');
      setStatus('success');
    } catch (err) {
      setMsg(err.message || 'Failed');
      setStatus('error');
    }
  };

  const handleDigit = (index, val) => {
    const v = val.replace(/\D/g, '').slice(0, 1);
    const next = [...codeDigits];
    next[index] = v;
    setCodeDigits(next);
    if (v && index < 5) {
      inputsRef.current?.[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputsRef.current?.[index - 1]?.focus();
    }
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
          <div className="verify-code">
            {codeDigits.map((d, i) => (
              <input
                key={i}
                ref={el => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="code-input"
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                required
              />
            ))}
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
