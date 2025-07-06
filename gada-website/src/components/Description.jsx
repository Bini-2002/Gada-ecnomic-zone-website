import React, { useState } from 'react';
import '../Description.css'; 
import thumbnailImage from '../Slide-Show/text-image-2.jpg'; 

export default function Description(){ 
  const [showVideo, setShowVideo] = useState(false);

  /**
   * Extracts the YouTube video ID from various URL formats and constructs a clean embed URL.
   * @param {string} url - The original YouTube URL.
   * @returns {string} The embeddable YouTube URL or an empty string if the ID can't be found.
   */
  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    // Regex to find video ID from standard watch URLs, youtu.be URLs, and embed URLs
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match && match[1]) {
      videoId = match[1];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&wmode=transparent`;
    }
    
    console.error("Could not extract YouTube video ID from URL:", url);
    return ''; // Return empty string if no ID is found
  };

  // You can now use a simple, standard YouTube URL here.
  const originalVideoUrl = "https://www.youtube.com/watch?v=lCotCKk5z2I";
  const videoUrl = getYouTubeEmbedUrl(originalVideoUrl);

  return (
    <div className="description-section">
      <div className="content-wrapper">
        <div className="image-card">
          <div className="video-thumbnail-container">
            {!showVideo ? (
              <>
                <img
                  src={thumbnailImage}
                  alt="Video Thumbnail"
                  className="video-thumbnail"
                  onClick={() => setShowVideo(true)}
                />
                <div className="play-button-overlay" onClick={() => setShowVideo(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="play-video-text">Play Video</span>
                </div>
              </>
            ) : (
              videoUrl ? (
                <iframe
                  className="embedded-video"
                  src={videoUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <p>Could not load video. Invalid URL or embed issue.</p>
              )
            )}
          </div>
        </div>

        <div className="about-gsez">
          <h3>About GSEZ</h3>
          <div className="description-text">
            <p>The purposes of creating Special Economic Zones are to achieve the 
              economic and social transformation of the region through promoting a 
              conducive policy and providing critical public goods, attracting foreign 
              and domestic investment, enhancing technology transfer needed to expand manufacturing 
              activities, creates jobs, generate multiplier impact on the 
              economy and promote regional development.</p>
          </div>
          <button className="read-story-button">Read our story</button>
        </div>
      </div>
    </div>
  );
};

