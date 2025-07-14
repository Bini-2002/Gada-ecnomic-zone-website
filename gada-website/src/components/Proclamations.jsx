import ProclamationsImg from '../images/proclamation.png';
import Proclamations1 from '../images/proclamation-1.jpg';
import Proclamations2 from '../images/proclamation-2.jpg';
import '../Proclamations.css';
import proclamationFile1322 from '../Files/Special-Economic-Zone-Proclamation-No.-1322_2024-3.pdf';
import proclamationFile226 from '../Files/Proclamation-226-2020.pdf';


export default function Proclamations() {
  return (
    <div className="proclamations">
      <h1>PROCLAMATIONS</h1>
      <div className="proclamation-image">
        <img src={ProclamationsImg} alt="Proclamations" />
      </div>
      <h2>Key Points: Special Economic Zone Proclamation No. 1322/2024</h2>
      <p>(From Special-Economic-Zone-Proclamation-No.-1322_2024-3.pdf)</p>

      <ul>
        <li>Upgrades Ethiopia’s industrial parks system into a full Special Economic Zone (SEZ) regime for greater economic diversification.</li>
        <li>Establishes a flexible, business-friendly framework to attract investment and integrate into global value chains.</li>
        <li>Defines SEZs to include industry parks, free trade zones, logistics hubs, science and tech parks, and agricultural zones.</li>
        <li>Grants duty-free and tax-free privileges, one-stop-shop services, and special incentives to SEZ investors.</li>
        <li>Clarifies roles for developers, operators, enterprises, and outlines detailed definitions for SEZ structures.</li>
        <li>Facilitates efficient regional and global trade competitiveness through better infrastructure and streamlined regulations.</li>
        <li>Based on Ethiopia’s Federal Constitution Article 55(1) and supports national economic growth strategies.</li>
      </ul>

      <h4>Learn more about the Gada Special Economic Zone and its legal framework: Download to Proclamation No. 1322/2024.</h4>
      <a href={proclamationFile1322} download className="proclamation-download-btn">
        <button type="button">Download</button>
      </a>

      <div className="proclamation-image">
        <img src={Proclamations1} alt="Proclamations" />
        <img src={Proclamations2} alt="Proclamations" />
      </div>

      <h2>Key Points from Proclamation No. 226/2020 (Gada Special Economic Zone)</h2>

      <h3>1.Establishment:</h3>
      <ul>
        <li>The Geda Special Economic Zone (SEZ) is established to accelerate economic transformation, attract foreign investment, and create export-oriented industries in the Oromia Region, Ethiopia.</li>
      </ul>

      <h3>2.Objectives</h3>
      <ul>
        <li>Promote industrial growth, job creation, and technology transfer.</li>
        <li>Enhance regional and national economic benefits.</li>
        <li>Integrate local communities (farmers and residents) into development activities.</li>
      </ul>

      <h3>3.Zone Coverage</h3>
      <ul>
        <li>Located between Adama and Modjo towns, covering 24,000 hectares (expandable).</li>
        <li>Includes industrial parks, free trade zones, agro-processing areas, tourism sites, and residential areas.</li>
      </ul>

      <h3>4.Rights & Obligations:</h3>
      <ul>
        <li>Investors/Developers: Lease land, sub-lease developed plots, access tax incentives, and employ locals.</li>
        <li>Local Communities: Priority in jobs, compensation for land use, and shares in projects.</li>
      </ul>

      <h3>5.Governance:</h3>
      <ul>
        <li>Managed by the Geda SEZ Authority (accountable to a Board).</li>
        <li>One-stop service center for permits and investor support.</li>
      </ul>

      <h3>6.Legal Framework:</h3>
      <ul>
        <li>Overrides conflicting laws; disputes resolved via arbitration/courts.</li>
      </ul>

      <h3>7.Effective Date:</h3>
      <ul>
        <li>Enacted on February 19, 2020.</li>
      </ul>

      <h4>Learn more about the Gada Special Economic Zone and its legal framework: download to Proclamation No. 226/2020.</h4>
      <a href={proclamationFile226} download className="proclamation-download-btn">
        <button type="button">Download</button>
      </a>
    </div>
  );
}