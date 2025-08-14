import NationalBanklogo from '../office-image/NBE.png';
import FinananceMinisterLogo from '../office-image/finance.jpg';
import EthiopiaInvestmentLogo from '../office-image/ethiopia-investment.png';
import ForeignAffairsLogo from '../office-image/foreign-affairs.jpg';
import INVEALogo from '../office-image/INVEA.png';
import OromiaInvestmentLogo from '../office-image/oromia-investment-commision.jpg';
import PrimeMinisterOffice from '../office-image/PMO.jpg';
import OromiaLogo from '../office-image/oromia-logo.png';
import '../Footer.css';
import logoImage from '../images/GSEZ-Horizontal-logo.png';
import { useState } from 'react';
import { registerUser } from '../api';

const officeLogos = [
  { src: NationalBanklogo, alt: 'National Bank of Ethiopia' },
  { src: FinananceMinisterLogo, alt: 'Ministry of Finance' },
  { src: EthiopiaInvestmentLogo, alt: 'Ethiopian Investment Commission' },
  { src: ForeignAffairsLogo, alt: 'Ministry of Foreign Affairs' },
  { src: INVEALogo, alt: 'INVEA' },
  { src: OromiaInvestmentLogo, alt: 'Oromia Investment Commission' },
  { src: PrimeMinisterOffice, alt: 'Prime Minister Office' },
  { src: OromiaLogo, alt: 'Oromia Regional State' }
];

export default function Footer() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!username) {
      setMessage("Username is required.");
      return;
    }
    const res = await registerUser({ username, email, password, role: "user" });
    if (res.id) {
      setMessage("Registration successful! You can now log in.");
      setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
    } else {
      setMessage(res.detail || "Registration failed.");
    }
  };

  return (
    <footer className="footer">
      <h3 className="footer-title">Our Partners</h3>
      <div className='company-logo-slider'>
        <ul className='company-list'>
          {officeLogos.map((logo, index) => (
            <li key={`logo-a-${index}`}>
              <img src={logo.src} alt={logo.alt} />
            </li>
          ))}
          {/* Duplicate logos for seamless animation */}
          {officeLogos.map((logo, index) => (
            <li key={`logo-b-${index}`}>
              <img src={logo.src} alt={logo.alt} />
            </li>
          ))}
        </ul>
      </div>

      <div className='footer-bottom-content'>
        <div className='address'>
          <p><i className="fi fi-rr-envelope"></i>Email: info@gadasez.gov.et</p>
          <p><i className="fi fi-rr-phone-call"></i>Tel :+251 22 21 21 121, +251 22 21 22 692</p>
          <p><i className="fi fi-rr-marker"></i>Adama City, Melka Adama Sub-City, Abba Gada</p>
        </div>

    <form className="footer-form" onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input type="text" placeholder="Enter your username" name='username' value={username} onChange={e => setUsername(e.target.value)} required /> <br />
      <label htmlFor="email">Email</label>
      <input type="email" placeholder="Subscribe to our website" name='email' value={email} onChange={e => setEmail(e.target.value)} required /> <br />
      <label htmlFor="password">Password</label>
      <input type="password" placeholder="Enter your password" name='password' value={password} onChange={e => setPassword(e.target.value)} required /> <br />
      <label htmlFor="confirm-password">Confirm Password</label>
      <input type="password" placeholder="Confirm your password" name='confirm-password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /> <br/>
      <button type="submit">Subscribe</button>
      {message && <div style={{marginTop:8, color: message.includes('success') ? 'green' : 'red'}}>{message}</div>}
    </form>

        <div className='visitor-stats'>
          <h4>Visitor Statistics</h4>
          <p>Total Visitors: <strong>1,234</strong></p>
          <p>Views Today: <strong>56</strong></p>
          <p>Total Views: <strong>15,678</strong></p>
          <p>Who's Online: <strong>12</strong></p>
        </div>
      </div>

      <div className="footer-end">
        <div className="footer-logo">
            <img src={logoImage} alt="Gada Economic Zone Logo" />
        </div>
        <div className="social-media-icons">
            <a href="#" aria-label="Facebook"><i className="fi fi-brands-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i className="fi fi-brands-twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fi fi-brands-linkedin"></i></a>
            <a href="#" aria-label="Instagram"><i className="fi fi-brands-instagram"></i></a>
            <a href="#" aria-label="Telegram"><i className="fi fi-brands-telegram"></i></a>
            <a href="#" aria-label="YouTube"><i className="fi fi-brands-youtube"></i></a>
        </div>
        <p className="copyright-text">&copy; 2025 Gada Special Economic Zone. All Rights Reserved.</p>
      </div>
    </footer>
  )

}