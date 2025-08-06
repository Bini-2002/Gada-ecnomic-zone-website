import '../Investment.css';

function Investments() {
  return (
    <div className="investments-container">
      <h1 className="investments-title">Investment Opportunities</h1>

      <div className="investment-zone">
        <h2>Free Trade Zone</h2>
        <img src="https://www.gadasez.gov.et/wp-content/uploads/2025/06/photo_2025-06-21_08-55-11.jpg" alt="Free Trade Zone" />
        <p>
          A free trade zone (FTZ) is a type of special economic zone (SEZ) that focuses on facilitating trade and commerce,
          often located near ports or borders. It’s a designated area where goods can be imported and exported without the
          usual customs duties and bureaucratic processes. Gada Special Economic Zone Free Trade Zone is a prominent example,
          aiming to boost economic activity and attract foreign investment.
        </p>
        <p>
          FTZ is a specific type of SEZ that primarily focuses on trade and logistics, 
          offering duty-free zones for warehousing, storage, and distribution.
        </p>
        <p><strong>Key Features of FTZs:</strong></p>
        <ul>
          <li>Duty-free import and export: Goods can be imported into an FTZ without paying import duties, and exported without paying export duties.</li>
          <li>Simplified customs procedures: FTZs streamline customs processes, reducing paperwork and delays.</li>
          <li>Focus on trade and logistics: FTZs are often located near major ports, airports, or border crossings, facilitating the movement of goods.</li>
          <li>Warehousing and distribution: FTZs provide facilities for storing, handling, and distributing goods.</li>
        </ul>
      </div>

      <div className="investment-zone">
        <h2>Industrial Park</h2>
        <img src="https://www.gadasez.gov.et/wp-content/uploads/2025/07/industrial.jpg" alt="Industrial Park" />
        <p>
          Modern logistics center, white van and trailers standing on ramp.
          An industrial park within a special economic zone (SEZ) is a designated area designed to attract investment and 
          promote industrial development, often with specific incentives and streamlined regulations. Essentially, 
          it’s a specialized part of a larger SEZ focused on manufacturing and related activities, leveraging shared 
          infrastructure and resources to boost efficiency and productivity.
        </p>
      </div>

      <div className="investment-zone">
        <h2>Information Communication Technology (ICT) Zone</h2>
        <p>
          The ICT Park within the Gada Special Economic Zone is envisioned as a hub for innovation, 
          research, and digital enterprise. Equipped with high-speed internet, state-of-the-art infrastructure,
          and a supportive regulatory framework, this zone is designed to attract global tech companies, startups, 
          and IT service providers. It offers a conducive environment for software development, data centers, 
          business process outsourcing (BPO), and other digital industries, fostering Ethiopia's growth as a 
          technology-driven economy.
        </p>
      </div>

      <div className="investment-zone">
        <h2>Agro-Processing and Urban Farming Zone</h2>
        <p>
          Harnessing Ethiopia’s agricultural richness, the Agro-Processing and Urban Farming Zone 
          promotes sustainable development through modern farming practices and value-added production. 
          This zone provides investors with access to fertile land, clean water, and proximity to raw materials, 
          making it ideal for food processing, packaging, and distribution. The integration of urban farming not 
          only supports local food security but also opens up scalable business models for organic and eco-friendly 
          produce in both local and export markets.
        </p>
      </div>

      <div className="investment-zone">
        <h2>Tourism and Recreational Zone</h2>
        <p>
          Positioned to showcase Ethiopia’s natural beauty and cultural heritage, the Tourism and Recreational Zone offers
           a unique blend of relaxation, adventure, and cultural exploration. Investors are invited to develop luxury resorts
           , eco-lodges, amusement parks, cultural centers, and wellness retreats in a landscape that combines scenic beauty 
           with historical significance. This zone aims to boost Ethiopia’s tourism sector by creating a world-class destination 
           for both domestic and international travelers.
          </p>
      </div>

      <div className="investment-zone">
        <h2>Residence and Real Estate Zone</h2>
        <p>
          The Residence and Real Estate zone is a master-planned urban development offering premium residential, commercial, and mixed-use properties. Designed with modern living in mind, this area includes high-rise apartments, gated communities, office spaces, and retail centers. It provides investors with lucrative opportunities in Ethiopia’s growing real estate market while meeting the housing and commercial needs of professionals, expatriates, and families within the economic zone.
        </p>
      </div>
    </div>
  );
}

export default Investments;