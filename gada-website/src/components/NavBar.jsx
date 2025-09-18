import { useState, useContext, useEffect } from 'react';
import logoImage from '../images/GSEZ-Horizontal-logo.png';
import '../index.css';
import '../NavBar.css';
import { ThemeContext } from './ThemeContext';

export default function NavBar({ userRole, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOneStopOpen, setIsOneStopOpen] = useState(false);
  const [isResourceOpen, setIsResourceOpen] = useState(false);
  const [isOpportunityOpen, setIsOpportunityOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setHasValidToken(false); return; }
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('token');
        setHasValidToken(false);
      } else {
        setHasValidToken(true);
      }
    } catch {
      setHasValidToken(false);
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    window.location.hash = '#news';
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0,0); }
    window.location.reload();
  };

  const navigateTo = (hash) => {
    window.location.hash = hash;
    // close all menus
    setIsDropdownOpen(false);
    setIsOneStopOpen(false);
    setIsResourceOpen(false);
    setIsOpportunityOpen(false);
    setIsMenuOpen(false);
    // scroll to top for context
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0,0); }
  };

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
                  <a href="#standard" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#standard'); }}>
                    Standard Operation Procedure
                  </a>
                  <a href="#investor" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#investor'); }}>
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
                  <a href="#value-proposition" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#value-proposition'); }}>
                    Value Proposition
                  </a>
                  <a href="#proclamations" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#proclamations'); }}>
                    Proclamations
                  </a>
                  <a href="#regulations" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#regulations'); }}>
                    Regulations
                  </a>
                  <a href="#directives" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#directives'); }}>
                    Directives
                  </a>
                  <a href="#annual-executive" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#annual-executive'); }}>
                    Annual Executive
                  </a>
                  <a href="#media-gallery" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#media-gallery'); }}>
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
                  <a href="#investments" className="nav-submenu-item" onClick={(e) => { e.preventDefault(); navigateTo('#investments'); }}>
                    Investments
                  </a>
                  <a href="#incentives" className="nav-submenu-item" onClick={() => setIsOpportunityOpen(false)}>
                    Incentives
                  </a>
                </div>
              </div>
              <a href="#news" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigateTo('#news'); }}>News & Events <i className="fi fi-rr-angle-small-right"></i></a>
              {/* Only show Admin Dashboard if logged in as admin */}
              {hasValidToken && userRole === 'admin' && (
                <a href="#admin-dashboard" className="nav-link-item" style={{ color: '#e53935', fontWeight: 700 }}>Admin Dashboard</a>
              )}
              {hasValidToken ? (
                <button onClick={handleLogout} className="nav-link-item" style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>Logout</button>
              ) : (
                <a href="#log-in" className="nav-link-item" onClick={(e)=>{ e.preventDefault(); navigateTo('#log-in'); }}>Log in / Sign up </a>
              )}
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
              <a href="#home" className="nav-link-item" onClick={(e)=>{ e.preventDefault(); navigateTo('#home'); }}>Home</a>
            </div>
            <div className="nav-links-pad">
              <a href="#about" className="nav-link-item" onClick={(e)=>{ e.preventDefault(); navigateTo('#about'); }}>About Us</a>
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

        {/* Always-visible auth control on the right side */}
        {hasValidToken ? (
          <button
            onClick={() => { handleLogout(); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0,0); } }}
            aria-label="Logout"
            className="logout-button"
          >
            Logout
          </button>
        ) : (
          <a href="#log-in" className="nav-link-item" style={{ marginLeft: 8 }} onClick={(e)=>{ e.preventDefault(); navigateTo('#log-in'); }}>Log in / Sign up</a>
        )}
      </div>

      <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <i className={isMenuOpen ? 'fi fi-rr-cross' : 'fi fi-rr-menu-burger'}></i>
      </button>
    </nav>
  );
}