import { useState, useEffect, useRef } from 'react';
import '../MainContent.css';
import '../index.css';

// Imports for Slideshow
import textImage1 from '../Slide-Show/text-image-1.jpg';
import textImage2 from '../Slide-Show/text-image-2.jpg';
import slidePhoto1 from '../Slide-Show/gada-slide-photo1.jpg';
import slidePhoto2 from '../Slide-Show/gada-slide-photo2.jpg';
import slidePhoto4 from '../Slide-Show/gada-slide-photo4.jpg';
import slidePhoto5 from '../Slide-Show/gada-slide-photo5.jpg';
import slidePhoto7 from '../Slide-Show/gada-slide-photo7.png';
import slidePhoto8 from '../Slide-Show/gada-slide-photo8.jpg';

// Imports for Message Section
import MessageImage1 from "../Message/message-holder1.jpg";
import MessageImage2 from "../Message/message-holder2.jpg";

const slides = [
  {
    image: textImage1,
    title: 'Empower Our Economy',
    buttonText: 'Learn More',
  },
  {
    image: textImage2,
    title: 'GADA SPECIAL ECONOMIC ZONE',
  },
  { image: slidePhoto1 },
  { image: slidePhoto2 },
  { image: slidePhoto4 },
  { image: slidePhoto5 },
  { image: slidePhoto7 },
  { image: slidePhoto8 },
];

const messageSlides = [
  {
    image: MessageImage1,
    name: 'H.E. Mr. Shimelis Abdisa',
    title: 'President of Oromia National Regional State',
    text: 'Gada Special Economic Zone (GSEZ) is a new phenomenon in the industrial, trade, investment and urban development strategies in Oromia. It will play a strategic central role in the industrialization and urbanization of our nation.'
  },
  {
    image: MessageImage2,
    name: 'Mr. Motuma Temesgen',
    title: 'CEO of Gada Special Economic Zone',
    text: 'As the national and regional prior economic plan to power socio-economic prosperity, Gada special economic zone intends to be a pioneer of free trade, export processing, recreational and a smart industrial city by 2062.'
  }
];

export default function MainContent() {
  // State and logic for the main slideshow
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const touchStartX = useRef(null);

  const goToPreviousSlide = () => {
    const isFirstSlide = slideshowIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : slideshowIndex - 1;
    setSlideshowIndex(newIndex);
  };

  const goToNextSlide = () => {
    const isLastSlide = slideshowIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : slideshowIndex + 1;
    setSlideshowIndex(newIndex);
  };

  useEffect(() => {
    const slideshowTimer = setTimeout(goToNextSlide, 7000);
    return () => clearTimeout(slideshowTimer);
  }, [slideshowIndex]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;

    if (swipeDistance > 50) {
      goToPreviousSlide();
    } else if (swipeDistance < -50) {
      goToNextSlide();
    }
  };

  // State and logic for the message section
  const [messageIndex, setMessageIndex] = useState(0);

  const goToPreviousMessage = () => {
    const isFirstMessage = messageIndex === 0;
    const newIndex = isFirstMessage ? messageSlides.length - 1 : messageIndex - 1;
    setMessageIndex(newIndex);
  };

  const goToNextMessage = () => {
    const isLastMessage = messageIndex === messageSlides.length - 1;
    const newIndex = isLastMessage ? 0 : messageIndex + 1;
    setMessageIndex(newIndex);
  };

  useEffect(() => {
    const messageTimer = setTimeout(goToNextMessage, 5000);
    return () => clearTimeout(messageTimer);
  }, [messageIndex]);

  const { image, name, title, text } = messageSlides[messageIndex];

  return (
    <div className="main-content">
      {/* Slideshow Section */}
      <div 
        className="slideshow-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="slides-wrapper" style={{ transform: `translateX(-${slideshowIndex * 100}%)` }}>
          {slides.map((slide, index) => (
            <div
              className="slide"
              key={index}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay"></div>
              <div className="slide-content">
                {slide.title && <h1 className="slide-title">{slide.title}</h1>}
                {slide.buttonText && <button className="slide-button">{slide.buttonText}</button>}
              </div>
            </div>
          ))}
        </div>
        <button className="slide-arrow left-arrow" onClick={goToPreviousSlide} aria-label="Previous Slide">&#10094;</button>
        <button className="slide-arrow right-arrow" onClick={goToNextSlide} aria-label="Next Slide">&#10095;</button>
        <div className="dots-container">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${slideshowIndex === index ? 'active' : ''}`}
              onClick={() => setSlideshowIndex(index)}
            ></div>
          ))}
        </div>
      </div>

      {/* Message Section */}
      <section className="message-container">
        <h1 className="message-main-title">A Message from Our Leaders</h1>
        <div className="message-slider">
          <div className="message-card">
            <p className="message-text">"{text}"</p>
            <div className="message-owner">
              <img src={image} alt={name} className="owner-image" />
              <div className="owner-details">
                <h2 className="owner-name">{name}</h2>
                <h3 className="owner-title">{title}</h3>
              </div>
            </div>
          </div>
          <div className="message-slider-nav">
            <button onClick={goToPreviousMessage} aria-label="Previous Message">&#10094;</button>
            <button onClick={goToNextMessage} aria-label="Next Message">&#10095;</button>
          </div>
        </div>
      </section>
    </div>
  );
}
