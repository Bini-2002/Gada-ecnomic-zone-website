import { useState, useContext } from 'react';
import logoImage from '../images/GSEZ-Horizontal-logo.png';
import '../index.css'; 
import '../NavBar.css'; 
import { ThemeContext } from './ThemeContext';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOneStopOpen, setIsOneStopOpen] = useState(false);
  const [isResourceOpen, setIsResourceOpen] = useState(false);
  const [isOpportunityOpen, setIsOpportunityOpen] = useState(false);
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
              <div className="nav-link-item nav-has-dropdown"
                tabIndex={0}
              >
                One Stop Services
                <i
                  className={isOneStopOpen ? "fi fi-rr-angle-small-down" : "fi fi-rr-angle-small-right"}
                  style={{ marginLeft: 6, cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    setIsOneStopOpen(v => !v);
                  }}
                  tabIndex={0}
                  aria-label="Toggle One Stop submenu"
                ></i>
                <div className="nav-submenu" style={{ display: isOneStopOpen ? 'block' : 'none' }}>
                  <a href="#standard" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#standard'; setIsDropdownOpen(false); setIsOneStopOpen(false);}}>
                    Standard Operation Procedure
                  </a>
                  <a href="#investor" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#investor'; setIsDropdownOpen(false); setIsOneStopOpen(false);}}>
                    Investor Roadmap
                  </a>
                </div>
              </div>
              <div className="nav-link-item nav-has-dropdown"
                tabIndex={0}
              >
                Resource Center
                <i
                  className={isResourceOpen ? "fi fi-rr-angle-small-down" : "fi fi-rr-angle-small-right"}
                  style={{ marginLeft: 6, cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    setIsResourceOpen(v => !v);
                  }}
                  tabIndex={0}
                  aria-label="Toggle Resource submenu"
                ></i>
                <div className="nav-submenu" style={{ display: isResourceOpen ? 'block' : 'none' }}>
                  <a href="#value-proposition" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#value-proposition'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Value Proposition
                  </a>
                  <a href="#proclamations" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#proclamations'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Proclamations
                  </a>
                  <a href="#regulations" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#regulations'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Regulations
                  </a>
                  <a href="#directives" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#directives'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Directives
                  </a>
                  <a href="#annual-executive" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#annual-executive'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Annual Executive
                  </a>
                  <a href="#media-gallery" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#media-gallery'; setIsDropdownOpen(false); setIsResourceOpen(false);}}>
                    Media Gallery
                  </a>
                </div>
              </div>
              <div className="nav-link-item nav-has-dropdown"
                tabIndex={0}
              >
                Opportunity & Incentive
                <i
                  className={isOpportunityOpen ? "fi fi-rr-angle-small-down" : "fi fi-rr-angle-small-right"}
                  style={{ marginLeft: 6, cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    setIsOpportunityOpen(v => !v);
                  }}
                  tabIndex={0}
                  aria-label="Toggle Opportunity submenu"
                ></i>
                <div className="nav-submenu" style={{ display: isOpportunityOpen ? 'block' : 'none' }}>
                  <a href="#investments" className="nav-submenu-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#investments'; setIsDropdownOpen(false); setIsOpportunityOpen(false);}}>
                    Investments
                  </a>
                  <a href="#incentives" className="nav-submenu-item" onClick={() => setIsOpportunityOpen(false)}>
                    Incentives
                  </a>
                </div>
              </div>
            <a href="#news" className="nav-link-item" onClick={(e) => {e.preventDefault(); window.location.hash = '#news'; setIsDropdownOpen(false);}}>News & Events <i className="fi fi-rr-angle-small-right"></i></a>
              <a href="#services" className="nav-link-item">Services <i className="fi fi-rr-angle-small-right"></i></a>
              <a href="#value" className="nav-link-item">Value Proposition <i className="fi fi-rr-angle-small-right"></i></a>
              <a href="#involved" className="nav-link-item">Get Involved <i className="fi fi-rr-angle-small-right"></i></a>
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

            {/* News & Events link is only in the dropdown above */}
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

        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          <i className={isMenuOpen ? 'fi fi-rr-cross' : 'fi fi-rr-menu-burger'}></i>
        </button>
    </nav>
  );
}