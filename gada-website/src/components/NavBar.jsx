import { useState, useContext } from 'react';
import logoImage from '../images/GSEZ-Horizontal-logo.png';
import '../index.css'; 
import '../NavBar.css'; 
import { ThemeContext } from './ThemeContext';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className="navbar-grid-left">
        <div className="nav-dropdown-menu-bar">
          <button className="nav-dropdown-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Open more menu">
            <i className="fi fi-rr-list"></i>
          </button>
          {isDropdownOpen && (
            <div className="nav-dropdown-list">
              <div className="nav-link-item nav-has-dropdown">
                One Stop Services <i className="fi fi-rr-angle-small-down"></i>
                <div className="nav-submenu">
                  <a href="#standard" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#standard';}}>
                    Standard Operation Procedure
                  </a>
                  <a href="#investor" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#investor';}}>
                    Investor Roadmap
                  </a>
                </div>
              </div>
              <div className="nav-link-item nav-has-dropdown">
                Resource Center <i className="fi fi-rr-angle-small-down"></i>
                <div className="nav-submenu">
                  <a href="#value-proposition" className="nav-submenu-item">Value Proposition</a>
                  <a href="#proclamations" className="nav-submenu-item">Proclamations</a>
                  <a href="#regulations" className="nav-submenu-item">Regulations</a>
                  <a href="#directives" className="nav-submenu-item">Directives</a>
                  <a href="#annual-executive" className="nav-submenu-item">Annual Executive</a>
                  <a href="#media-gallery" className="nav-submenu-item">Media Gallery</a>
                </div>
              </div>
              <a href="#opportunity" className="nav-link-item">Opportunity & Incentive <i class="fi fi-rr-angle-small-down"></i></a>
              <a href="#news" className="nav-link-item">News & Events <i class="fi fi-rr-angle-small-down"></i></a>
              <a href="#services" className="nav-link-item">Services <i class="fi fi-rr-angle-small-down"></i></a>
              <a href="#value" className="nav-link-item">Value Proposition <i class="fi fi-rr-angle-small-down"></i></a>
              <a href="#involved" className="nav-link-item">Get Involved <i class="fi fi-rr-angle-small-down"></i></a>
              <a href="#log-in" className="nav-link-item">Log in </a>
            </div>
          )}
        </div>
        <div className="logo">
          <img src={logoImage} alt="Gada Economic Zone Logo" />
        </div>
      </div>

      <div className="navbar-grid-middle">
        <div className='logo-title-container'>
          <div className="title-container" >
            <span className='title-oro'>Zoonii Diinagde Addaa Gadaa</span>
            <span className='title-amh'>ገዳ ልዩ የኢኮኖሚ ዞን</span>
            <span className='title-eng'>Gada Special Economic Zone</span>
          </div>
        </div>
      </div>

      <div className="navbar-grid-right">
        <div className={`menu-container ${isMenuOpen ? 'active' : ''}`}> 
          <div className="nav-links-container">
            <div className="nav-links">
              <div className="nav-links-pad">
                <a href="#home" className="nav-link-item">Home</a>
              </div>
              <div className="nav-links-pad">
                <a href="#about" className="nav-link-item">About Us</a>
              </div>
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
      </div>

      <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <i className={isMenuOpen ? 'fi fi-rr-cross' : 'fi fi-rr-menu-burger'}></i>
      </button>
    </nav>
  );
}