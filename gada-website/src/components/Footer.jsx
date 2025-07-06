import NationalBanklogo from '../office-image/NBE.png';
import FinananceMinisterLogo from '../office-image/finance.jpg';
import EthiopiaInvestmentLogo from '../office-image/ethiopia-investment.png';
import ForeignAffairsLogo from '../office-image/foreign-affairs.jpg';
import INVEALogo from '../office-image/INVEA.png';
import OromiaInvestmentLogo from '../office-image/oromia-investment-commision.jpg';
import PrimeMinisterOffice from '../office-image/PMO.jpg';
import OromiaLogo from '../office-image/oromia-logo.png';
import '../Footer.css'; 

const officeLogos = [
  { src: NationalBanklogo, alt: 'National Bank of Ethiopia' },
  { src: FinananceMinisterLogo, alt: 'Ministry of Finance' },
  { src: EthiopiaInvestmentLogo, alt: 'Ethiopian Investment Commission' },
  { src: ForeignAffairsLogo, alt: 'Ministry of Foreign Affairs' },
  { src: INVEALogo, alt: 'INVEA' },
  { src: OromiaInvestmentLogo, alt: 'Oromia Investment Commission' },
  { src: PrimeMinisterOffice, alt: 'Prime Minister Office' },
  { src: OromiaLogo, alt: 'Oromia Regional State' }
];

export default function Footer() {
  return (
    <footer className="footer">
      <h3 className="footer-title">Our Partners</h3>
      <div className='company-logo-slider'>
        <ul className='company-list'>
          {officeLogos.map((logo, index) => (
            <li key={`logo-a-${index}`}>
              <img src={logo.src} alt={logo.alt} />
            </li>
          ))}
          {/* Duplicate logos for seamless animation */}
          {officeLogos.map((logo, index) => (
            <li key={`logo-b-${index}`}>
              <img src={logo.src} alt={logo.alt} />
            </li>
          ))}
        </ul>
      </div>
    </footer>
    )
      
}