import './index.css'
import { useContext, useEffect, useState } from 'react';
import NavBar from './components/NavBar.jsx';
import MainContent from './components/MainContent.jsx';
import Description from './components/Description.jsx';
import News from './components/News.jsx';
import Footer from './components/Footer.jsx'; 
import Standard from './components/Standard.jsx';
import Inverstor from './components/Inverstor.jsx';
import { ThemeContext } from './components/ThemeContext';


export default function App() {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState(window.location.hash);

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

  const renderContent = () => {
    switch (currentView) {
      case '#standard':
        return <Standard />;
      case '#investor':
        return <Inverstor />;
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
}

