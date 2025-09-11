import React, { useState } from 'react';
import '../InvestmentProposalPortal.css';
import { API_BASE } from '../config';

export default function InvestmentProposalPortal() {
  const [form, setForm] = useState({ name: '', email: '', sector: '', phone: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) { setFile(null); return; }
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    const MAX_MB = 15;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.sector.trim() || !form.phone.trim()) {
      setError('All fields are required.');
      return false;
    }
    const emailOk = /.+@.+\..+/.test(form.email);
    if (!emailOk) { setError('Please enter a valid email.'); return false; }
    const phoneOk = /^[+]?\d[\d\s-]{6,}$/.test(form.phone);
    if (!phoneOk) { setError('Please enter a valid phone number.'); return false; }
    if (!file) { setError('Please attach your proposal PDF.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('email', form.email.trim());
      data.append('sector', form.sector.trim());
      data.append('phone', form.phone.trim());
      data.append('proposal', file);

      const res = await fetch(`${API_BASE}/investor-proposals`, {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      if (res.ok) {
        setMessage('Your proposal has been submitted successfully. Our team will contact you shortly.');
        setForm({ name: '', email: '', sector: '', phone: '' });
        setFile(null);
        (document.getElementById('proposal-file') || {}).value = '';
      } else if (res.status === 404) {
        setError('Submission service is not available yet. Please try again later.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="portal-wrap">
      <div className="portal-hero">
        <h1>Investment Proposal Portal</h1>
        <p>Submit your project proposal to the Gada Special Economic Zone. Our One-Stop Service will review and support your investment journey.</p>
      </div>

      <form className="portal-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="sector">Sector</label>
            <input id="sector" name="sector" value={form.sector} onChange={onChange} placeholder="e.g., Manufacturing, Agro-processing" required />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="e.g., +251 9XX XXX XXX" required />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="proposal-file">Proposal (PDF)</label>
          <input id="proposal-file" type="file" accept="application/pdf" onChange={onFileChange} />
          <small>Upload a single PDF (max 15MB) covering your project summary, investment amount, and timeline.</small>
        </div>

        {error && <div className="form-alert error">{error}</div>}
        {message && <div className="form-alert success">{message}</div>}

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Proposal'}
          </button>
        </div>
      </form>

      <div className="portal-faq">
        <h3>What happens next?</h3>
        <ul>
          <li>Your proposal is reviewed by the GSEZ One-Stop Service team.</li>
          <li>We may contact you for clarifications and next steps.</li>
          <li>Upon approval, facilitation for permits, land, and utilities begins.</li>
        </ul>
      </div>
    </section>
  );
}
