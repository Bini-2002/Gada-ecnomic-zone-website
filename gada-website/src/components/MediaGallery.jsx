import React, { useState } from "react";
import "../MediaGallery.css";

// Use Vite's import.meta.glob to import all .jpg files

function MediaGallery() {
  const [zoomedImg, setZoomedImg] = useState(null);
  const imageModules = import.meta.glob("../media_gallery/*.jpg", { eager: true });
  const images = Object.entries(imageModules).map(([path, module]) => {
    const name = path.split("/").pop();
    return {
      src: module.default || module,
      name: name
    };
  });

  const handleImageClick = (img) => {
    setZoomedImg(img.src);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("gallery-zoom-overlay")) {
      setZoomedImg(null);
    }
  };

  return (
    <div className="media-gallery-container">
      <h2 className="gallery-title">Media Gallery</h2>
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <div className="gallery-item" key={idx}>
            <img src={img.src} alt={img.name} className="gallery-img" onClick={() => handleImageClick(img)} />
            <div className="gallery-caption"></div>
          </div>
        ))}
      </div>
      {zoomedImg && (
        <div className="gallery-zoom-overlay" onClick={handleOverlayClick}>
          <img src={zoomedImg} alt="Zoomed" className="gallery-zoom-img" />
        </div>
      )}
    </div>
  );
}

export default MediaGallery;