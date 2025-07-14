import RegulationsImg from '../images/proclamation.png';
import RegulationFile2 from '../Files/regulation_517_2022.pdf';
import RegulationFile1 from '../Files/Regulation-no.228-2022.pdf';
import '../Regulations.css';

function RegulationsPage() {
  return (
    <div className="regulations">
      <h1>REGULATIONS</h1>
      <div className="regulations-image">
        <img src={RegulationsImg} alt="Regulations" />
      </div>
      <h2>Key Points: Regulation to Establish the Gada Special Economic Zone Development Corporation, No. 228/2022</h2>
      <p>(From Regulation-no.228-2022.pdf)</p>

      <ul>
        <li>
        Establishes the Gada Special Economic Zone Development
        Corporation under Oromia Regional Government.</li>
        <li>
          Purpose: To develop, administer, and promote the Gada
          Special Economic Zone efficiently and competitively.
        </li>
        <li>
          Defines the Corporation’s structure: 
          <strong>Board of Directors</strong>, <strong>General Manager</strong>, and <strong>Deputy Managers</strong>.
        </li>
        <li> Focus areas:
          <li>
            Develop infrastructure 
            (roads, electricity, water, telecom) 
            within the Zone.</li>
          <li>Support local farmers and communities 
            by offering project participation.</li>
          <li>Facilitate investments and create a favorable environment for 
            domestic and foreign investors.</li>
          <li>Manage land allocations, build industrial, 
            commercial, and residential facilities.</li>
          <li>
            Set and implement standards for 
            developers, enterprises, and investors.
          </li>
        </li>
        <li>Encourages the use of local raw materials and supports technology transfer and industrialization.</li>
        <li>Establishes a One-Stop Service Center to assist investors and enterprises operating within the Zone.</li>
        <li>Aims to create employment opportunities and enhance regional economic benefits.</li>
      </ul>

      <p>Learn more about the Gada Special Economic Zone and its legal framework: download to Regulation No. 228/2022.</p>

      <a href={RegulationFile1} download className="proclamation-download-btn">
        <button type="button">Download</button>
      </a>

      <h2>Powerful Incentives Under Regulation No. 517/2022</h2>
      <p>
        The <strong>Investment Incentive Regulation No. 517/2022</strong> 
        provides robust legal backing for a wide array of tax 
        and customs benefits to both foreign and domestic investors. 
        Aligned with Ethiopia’s long-term growth vision, 
        this regulation ensures transparency, predictability, 
        and competitiveness in the investment environment.</p>
      
      <h3><strong>Key Features for Investors:</strong></h3>
      <ul>
        <li>
          <strong>Full Customs Duty Exemption</strong>
          Investors receive 100% exemption on import duties 
          for capital goods, construction materials, and 
          spare parts used for eligible investment projects.</li>
        <li>
          <strong>Income Tax Holiday</strong>
          Qualifying investments benefit from <strong>income tax</strong> exemptions 
          ranging from 3 to 15 years, depending on the sector and location.
        </li>
        <li>
          <strong>Additional Tax Privileges</strong>
          Investors may receive <strong>extended tax holidays</strong> for 
          reinvested profits or new investment expansions.
        </li>
        <li>
          <strong>Duty-Free Privileges for Exporters</strong>
          Manufacturers who export at least 60% of their 
          output can import raw materials duty-free for 
          use in export production.
        </li>
        <li>
          <strong>Customs Support for Industrial Parks and SEZs</strong>
          Industrial park developers and enterprises operating 
          in Special Economic Zones (SEZs) are eligible for 
          enhanced exemptions and facilitation services.
        </li>
      </ul>

      <a href={RegulationFile2} download className="proclamation-download-btn">
        <button type="button">Download</button>
      </a>
      
    </div>
  );
}

export default RegulationsPage;