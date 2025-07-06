import './index.css'
import { useContext, useEffect } from 'react';
import NavBar from './components/NavBar.jsx';
import MainContent from './components/MainContent.jsx';
import Description from './components/Description.jsx';
import News from './components/News.jsx';
import Footer from './components/Footer.jsx'; 
import { ThemeContext } from './components/ThemeContext';


export default function App() {
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      <NavBar />
      <MainContent />
      <News />
      <Description />
      <Footer />
    </>
  ) 
}

