import '../News.css';
import '../index.css'; // Ensure you have the correct path to your CSS file
import newsImage1 from '../News-image/news-image-left-1.jpg';
import newsImage2 from '../News-image/news-image-left-2.jpg';
import newsImage3 from '../News-image/news-image-left-3.jpg';
import ClockIcon from '../icons/clock.svg'; // Import the clock icon

const newsData = [
  {
    image: newsImage1,
    date: { day: '03', month: 'Jul', year: '2025' },
    title: 'GSEZ Secures Major Investment for Infrastructure',
    detail: 'The Gada Special Economic Zone has announced a landmark deal with international investors to fund new road and utility projects.'
  },
  {
    image: newsImage2,
    date: { day: '01', month: 'Jul', year: '2025' },
    title: 'New Tech Hub to Create 5,000 Jobs in Gada',
    detail: 'A partnership with a leading tech firm will establish a new innovation hub, bringing thousands of skilled jobs to the region.'
  },
  {
    image: newsImage3,
    date: { day: '28', month: 'Jun', year: '2025' },
    title: 'GSEZ Launches Green Energy Initiative',
    detail: 'The zone is pioneering sustainable development with a new initiative focused on solar and wind power for its industrial parks.'
  }
];

export default function News() {
  return (
    <div className="news-container">
      {newsData.map((article, index) => (
        <div className="news-card" key={index}>
          <div className="news-header">
            <div className="news-date">
              <div className="news-date-icon">
                <img src={ClockIcon} alt="Date" />
              </div>
              <span className="news-day">{article.date.day}</span>
              <span className="news-month">{article.date.month}</span>
              <span className="news-year">{article.date.year}</span>
            </div>
            <div className="news-separator"></div>
            <div className="news-image-container">
              <img src={article.image} alt={article.title} />
            </div>
          </div>
          <div className="news-title">
             <h2>{article.title}</h2>
          </div>
          <div className="news-detail">
            <p>{article.detail}</p>
          </div>
          <div className="news-continue-reading">
            <a href="#">Continue reading</a>
          </div>
        </div>
      ))}
    </div>
  );
}