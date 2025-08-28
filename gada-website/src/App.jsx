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
