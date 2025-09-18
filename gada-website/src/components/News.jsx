import React, { useState, useEffect } from "react";
import "../News.css";
import { getPosts } from "../api";
import { API_BASE } from "../config";

function resolveImageUrl(img) {
  if (!img) return img;
  // Uploaded images are served from backend /uploads; prefix with API_BASE for absolute URL
  if (typeof img === 'string' && img.startsWith('/uploads/')) return `${API_BASE}${img}`;
  return img;
}

function NewsCard({ id, title, details, date, image }) {
  const [showMore, setShowMore] = useState(false);
  const maxLen = 220;
  const isLong = details.length > maxLen;
  // Only pick the first image if multiple are present (comma, semicolon, or space separated)
  let firstImage = image;
  if (typeof image === 'string') {
    if (image.includes(',')) {
      firstImage = image.split(',')[0].trim();
    } else if (image.includes(';')) {
      firstImage = image.split(';')[0].trim();
    } else if (image.includes(' ')) {
      firstImage = image.split(' ')[0].trim();
    }
  }
  const src = resolveImageUrl(firstImage);
  return (
  <div className="news-card" onClick={() => { window.location.hash = `#news/${id}`; }} style={{cursor:'pointer'}}>
      <img src={src} alt={title} className="news-card-img" />
      <div className="news-card-content">
        <h3 className="news-card-title">{title}</h3>
        <div className="news-card-date">{date}</div>
        <p className="news-card-details">
          {showMore || !isLong ? details : details.slice(0, maxLen) + "..."}{" "}
          {isLong && (
            <span
              className="show-more-btn"
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? " Show less" : " Show more"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

const fallbackNews = [
  {
    title: "GSEZ is building dedicated substation",
    details: `Gada Special Economic Zone (GSEZ) is equipped with its own dedicated substation, currently under construction by Ethiopian Electric Power (EEP), which is expected to generate 230 MW/h starting from July 2025. This strategic infrastructure ensures reliable and uninterrupted power supply exclusively for industries within the zone, thereby eliminating one of the major constraints often faced by investors in emerging markets. With this vital utility in place, GSEZ presents a highly attractive opportunity for both local and international investors to confidently establish and expand their operations in a well-powered and investment-friendly environment.`,
    date: "2025-07-01",
    image: "/news-files/2025/07-july/01/01-july-1.jpg",
  },
  {
    title: "PMs Speech at the Parliament.",
    details: `Ethiopia’s industrial sector is projected to expand by approximately 12 percent in 2024/25, demonstrating tangible progress under the “Ethiopia Tamirt” initiative. National production capacity, previously at 59 percent, has now risen to 65 percent, primarily due to increased factory utilization. Industrial energy demand has surged to 40 percent, reflecting accelerated industrial activity. Notable sectoral gains include an 18 percent increase in steel production and substantial expansion in cement output. Efforts to achieve self-sufficiency in glass manufacturing are also underway, with a state-of-the-art glass factory—designed to produce 600,000 tons annually—scheduled for completion by December or January. Additionally, solar panel manufacturing plants are under construction and set to be inaugurated soon, reinforcing the country’s commitment to revitalizing and modernizing its industrial base. Our Prime Minister Dr. Abiy Ahmed said, “For Ethiopia to become competent in the global economic arena, leveraging on manufacturing industry is crucial. In this regard, the establishment of Gada Special Economic Zone (GSEZ) is instrumental in unlocking Oromia’s and Ethiopia’s vast potential for manufacturing industry.” Hence, GSEZ stands out as a leading initiative driving the industrial transformation of our nation. Come and build your future in GSEZ!`,
    date: "2025-07-02",
    image: "/news-files/2025/07-july/02-1/02-july-2-part-1.jpg",
  },
  {
    title: "Capacity-building training session on “Performance Evaluation” delivered to the staff of the GSEZ.",
    details: `A capacity-building training session on “Performance Evaluation” is currently being delivered to the staff of the Gada Special Economic Zone by H.E. Kebede Geneti (PhD). In his opening address, CEO Mr. Motuma Temesgen emphasized the importance of active staff engagement, stating that employees should take part in making history in the realization of the mission of GSEZ. The training is set to continue tomorrow with additional topics.\n\nLeenjiin ijaarsa dandeettii hojjettoota Zoonii Diinagdee Addaa Gadaatiif Mata duree, “Performance Evaluation” jedhamu irratti kennamaa jira. Haasawa baninsaa irratti Hojii Gageessaa Ola’aanaan Zoonichaa, obbo Mootummaa Tamsageen akka jedhanitti, “ nuti hojjettoonni zoonichaa qaama seenaa hojjetu ta’uu qabna!” jedhaniiru. Leenjichi mata dureelee adda adda irratti guyyaa boruus kan itti fufu ta’a.`,
    date: "2025-07-09",
    image: "/news-files/2025/07-july/09/01-july-9.jpg",
  },
];

function News({ previewCount }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 6;

  const isPreview = typeof previewCount === 'number' && previewCount > 0;

  const getItemDateString = (item) => {
    return item?.date || item?.publish_at || item?.created_at || item?.createdAt || item?.updated_at || null;
  };

  const getItemTime = (item) => {
    const ds = getItemDateString(item);
    if (!ds) return 0;
    const t = new Date(ds).getTime();
    return isNaN(t) ? 0 : t;
  };

  const loadPosts = async (reset = false) => {
    if (!hasMore && !reset) return;
    try {
      setLoading(true);
      const data = await getPosts({ skip: reset ? 0 : skip, limit: PAGE_SIZE, search: search || undefined });
      const items = (data.items || []).slice().sort((a,b) => getItemTime(b) - getItemTime(a));
      if (reset) {
        setPosts(items);
        setSkip(items.length);
      } else {
        setPosts(p => {
          const merged = [...p, ...items];
          return merged.slice().sort((a,b) => getItemTime(b) - getItemTime(a));
        });
        setSkip(s => s + items.length);
      }
      setHasMore(items.length === PAGE_SIZE);
    } catch (e) {
      setError(e.message || 'Failed to load posts');
      if (reset) setPosts([...fallbackNews].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(true); /* initial */ }, []);
  const handleSearch = (e) => { e.preventDefault(); setSkip(0); setHasMore(true); loadPosts(true); };

  const itemsToRender = isPreview ? (posts || []).slice(0, previewCount) : (posts || []);

  return (
    <div className="news-list-container">
      <h1 className="news-list-title">Latest News</h1>
      {!isPreview && (
        <form onSubmit={handleSearch} style={{display:'flex', gap:'0.5rem', margin:'0 0 1rem 0'}}>
          <input
            type="text"
              placeholder="Search news..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{flex:1, padding:'0.6rem 0.8rem', border:'1px solid #ccc', borderRadius:'0.5rem'}}
          />
          <button type="submit" style={{padding:'0.6rem 1rem', border:'none', background:'#e53935', color:'#fff', fontWeight:700, borderRadius:'0.5rem', cursor:'pointer'}}>Search</button>
        </form>
      )}
      {loading && <div className="news-loading">Loading...</div>}
      {error && !loading && <div className="news-error">{error}</div>}
      <div className="news-list-grid">
        {itemsToRender.map((item, idx) => (
          <NewsCard key={idx} {...item} />
        ))}
      </div>
      {!isPreview && !loading && hasMore && (
        <div style={{display:'flex', justifyContent:'center', marginTop:'1.25rem'}}>
          <button onClick={() => loadPosts(false)} style={{padding:'0.7rem 1.4rem', background:'#111', color:'#fff', border:'none', borderRadius:'0.5rem', fontWeight:700, cursor:'pointer'}}>Load More</button>
        </div>
      )}
      {!isPreview && !loading && !hasMore && posts.length > 0 && (
        <div style={{textAlign:'center', marginTop:'1rem', fontSize:'0.9rem', opacity:0.7}}>No more posts.</div>
      )}
      {isPreview && !loading && (posts.length > (previewCount || 0) || hasMore) && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a className="cta-btn" href="#news">See more news and events</a>
        </div>
      )}
    </div>
  );
}

export default News;
export { fallbackNews as newsData };