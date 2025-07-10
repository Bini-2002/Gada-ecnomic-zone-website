import { standard1 } from '../images/standard-1.jpg';
import { standard2 } from '../images/standard-2.jpg';
import '../Standard.css'

const standard1 = { src: { standard1 }, alt: 'Standard Plan Image 1' };
const standard2 = { src: { standard2 }, alt: 'Standard Plan Image 1' };


export default function Standard() {
  return (
    <div className="standard">
      <div className='oss-title'>
        <h1>Standard Operation procedure</h1>
      </div>
      
      <div className="standard-images">
        <img src={standard1} alt="Standard Plan Image 1" />
        <img src={standard2} alt="Standard Plan Image 2" />
      </div>
      <div className='oss-descriptions'>
        <h2>WHAT IS OSS?</h2>
        <p>
          Easy of doing business strategy at SEZ is provision of transparent, efficient, and dependable
          services in one place as “one stop service”. One Stop Service is an office where multiple
          services are offered to investors. And it is set up to enable investors obtain one-stop private
          and government services in one center. It mainly incorporates both private and governmental office.
        </p>
      </div>
      <div className='oss-services'>
        <h2>ONE-STOP-SHOP SERVICES</h2>
        <ul className='oss-services-list'>
          <li>Processing & issuance of investment permits</li>
          <li>Issuance of business licenses</li>
          <li>Commercial registration certificates</li>
          <li>Issuance of work permits</li>
          <li>Registration of trade or firm name</li>
          <li>Agreements</li>
          <li>Issuance of tax identification number</li>
          <li>Notarization of MoU</li>
          <li>Issuance of customs duty exemptions</li>
          <li>Customs clearance in SEZ</li>
          <li>Banking services, etc</li>
          <li>SPECIAL ECONOMIC ZONE LEASE AND/OR SUB-LEASE APPROVAL</li>
        </ul>
      </div>

      <div className="oss-application">
        <h2> How to apply to join SEZ</h2>
        <ol>
          <li>Submit your project document to GSEZ</li>
          <li>Sign an agreement with GSEZ</li>
          <li>Sign MoU with EIC</li>
          <li>Registration and Licensing at EIC</li>
          <li>Lease/Sub-lease agreement with SEZ</li>
          <li>Lease/Sub-Lease Payment</li>
          <li>Handover of the land</li>
        </ol>
      </div>

      <div className="oss-others">
        <h2>Other services</h2>
        <ul>
          <li>Waste treatment service</li>
          <li>Fire prevention and protection service</li>
          <li>Transfer of pre-built factory sheds</li>
          <li>Insurance certificate for leased buildings and/or factories</li>
          <li>Issuance of SEZ identity cards and renewals</li>
          <li>Access pass and renewals</li>
          <li>SEZ security service</li>
          <li>Processing and follow-up maintenance and repair requests</li>
          <li>Meeting arrangement with concerned stakeholders</li>
          <li>Aftercare service</li>
          <li>Investment support, utility services provision, infrastructure management</li>
        </ul>
      </div>

    </div>
  );
}

