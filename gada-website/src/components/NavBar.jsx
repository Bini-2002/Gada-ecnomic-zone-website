import { useState, useContext } from 'react';
import logoImage from '../images/GSEZ-Horizontal-logo.png';
import '../index.css'; // Ensure you have the correct path to your CSS file
import '../NavBar.css'; // Ensure you have the correct path to your CSS file
import { ThemeContext } from './ThemeContext';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className='logo-title-container'>
        <div className="logo">
          <img src={logoImage} alt="Gada Economic Zone Logo" />
        </div>
        <div className="title-container" >
          <span className='title-oro'>Zoonii Diinagde Addaa Gadaa</span>
          <span className='title-amh'>ገዳ ልዩ የኢኮኖሚ ዞን</span>
          <span className='title-eng'>Gada Special Economic Zone</span>
        </div>
      </div>
      

      <div className={`menu-container ${isMenuOpen ? 'active' : ''}`}>
        <div className="nav-links-container">
          <div className="nav-links">
            <a href="#home" className="nav-link-item">Home</a>
            <a href="#about" className="nav-link-item">About Us</a>
            <a href="#services" className="nav-link-item">Resource Center</a>
            <a href="#opportunity" className="nav-link-item">Opportunity & Incentive</a>
            <a href="#news" className="nav-link-item">News & Events</a>
            <a href="#contact" className="nav-link-item">Get Involved</a>
          </div>
        </div>

        <div className={`search-wrapper ${isSearchOpen ? 'active' : ''}`}>
          <button className="search-icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Toggle Search">
            <i className="fi fi-rr-search"></i>
          </button>
          <div className="search-container">
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <button onClick={toggleTheme} className="theme-switcher" aria-label="Toggle theme">
          <i className={isDarkMode ? 'fi fi-rr-sun' : 'fi fi-rr-moon'}></i>
        </button>

      </div>

      <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <i className={isMenuOpen ? 'fi fi-rr-cross' : 'fi fi-rr-menu-burger'}></i>
      </button>
    </nav>
  );
}