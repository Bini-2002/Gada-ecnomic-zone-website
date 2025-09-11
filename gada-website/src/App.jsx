import './index.css';
import { useContext, useEffect, useState } from 'react';
import NavBar from './components/NavBar.jsx';
import MainContent from './components/MainContent.jsx';
import Description from './components/Description.jsx';
import News from './components/News.jsx';
import NewsFeed from './components/NewsFeed.jsx';
import Footer from './components/Footer.jsx';
import Standard from './components/Standard.jsx';
import Inverstor from './components/Inverstor.jsx';
import ValueProposition from './components/ValueProposition.jsx';
import Proclamations from './components/Proclamations.jsx';
import RegulationsPage from './components/Regulations.jsx';
import Directives from './components/Directives.jsx';
import AnnualExecutive from './components/AnnualExecutive.jsx';
import MediaGallery from './components/MediaGallery.jsx';
import Investments from './components/Investments.jsx';
import { ThemeContext } from './components/ThemeContext';
import AdminDashboard from './components/AdminDashboard.jsx';
import LoginRegisterPage from './components/LoginRegisterPage.jsx';
import VerifyEmail from './components/VerifyEmail.jsx';
import InvestmentProposalPortal from './components/InvestmentProposalPortal.jsx';

function App() {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState(window.location.hash);
  const [userRole, setUserRole] = useState(null);

  const evaluateToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          localStorage.removeItem('token');
          setUserRole(null);
          return;
        }
        setUserRole(payload.role);
      } catch { setUserRole(null); }
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Check token and set user role
  useEffect(() => { evaluateToken(); }, [currentView]);

  const handleLogin = () => {
    evaluateToken();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        } else {
          window.location.hash = '#news';
        }
      } catch {}
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    window.location.hash = '#news';
  };

  const renderContent = () => {
    switch (currentView) {
      case '#standard':
        return <Standard />;
      case '#investor':
        return <Inverstor />;
      case '#value-proposition':
        return <ValueProposition />;
      case '#proclamations':
        return <Proclamations />;
      case '#regulations':
        return <RegulationsPage />;
      case '#directives':
        return <Directives />;
      case '#annual-executive':
        return <AnnualExecutive />;
      case '#media-gallery':
        return <MediaGallery />;
      case '#investments':
        return <Investments />;
      case '#news':
        return <News />;
      case '#investment-portal':
        return <InvestmentProposalPortal />;
      case '#admin-dashboard':
        if (userRole === 'admin') {
          return <AdminDashboard />;
        } else {
          // Not admin, redirect to news
          window.location.hash = '#news';
          return null;
        }
      case '#log-in':
        return <LoginRegisterPage onLogin={handleLogin} />;
      case '#verify-email':
        return <VerifyEmail />;
      default:
        // Handle News detail route like #news/123
        if (currentView.startsWith('#news/')) {
          const id = parseInt(currentView.replace('#news/',''), 10);
          if (!isNaN(id)) {
            return <NewsFeed postId={id} onBack={() => (window.location.hash = '#news')} />;
          }
        }
        return (
          <>
            <MainContent />
            <News />
            <div style={{maxWidth:980, margin:'1rem auto', padding:'1rem', background:'var(--card-bg)', color:'var(--card-text-color)', border:'1px solid var(--border-color)', borderRadius:12, boxShadow:'var(--box-shadow)'}}>
              <h2 style={{margin:'0 0 0.5rem 0'}}>Submit Your Investment Proposal</h2>
              <p style={{margin:'0 0 0.75rem 0'}}>Investors worldwide can submit project proposals directly to GSEZ. Our One-Stop Service team will review and guide you through incentives, permits, utilities, and land allocation.</p>
              <a href="#investment-portal" style={{
                display:'inline-block',
                background:'var(--danger-bg)',
                color:'#fff',
                padding:'0.6rem 1rem',
                borderRadius:8,
                border:'1px solid var(--danger-border)',
                fontWeight:800,
                textDecoration:'none'
              }}>Open Investment Proposal Portal</a>
            </div>
            <Description />
          </>
        );
    }
  };

  return (
    <>
      <NavBar userRole={userRole} onLogout={handleLogout} />
      {renderContent()}
      <Footer />
    </>
  );
}

export default App;
