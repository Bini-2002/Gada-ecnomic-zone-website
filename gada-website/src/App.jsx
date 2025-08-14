import './index.css'
import { useContext, useEffect, useState } from 'react';
import NavBar from './components/NavBar.jsx';
import MainContent from './components/MainContent.jsx';
import Description from './components/Description.jsx';
import News from './components/News.jsx';
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


  const { isDarkMode } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState(window.location.hash);
  const [userRole, setUserRole] = useState(null);

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
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT (simple base64, not secure, for demo)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [currentView]);

  const handleLogin = () => {
    // After login, update role and go to admin dashboard if admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
        if (payload.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        } else {
          window.location.hash = '#news';
        }
      } catch {}
    }
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
      default:
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
      <NavBar />
      {renderContent()}
      <Footer />
    </>
  ) 

