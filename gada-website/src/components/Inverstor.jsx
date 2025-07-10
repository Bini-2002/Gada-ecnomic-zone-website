import InvestorRoadmap from '../images/investor.png';

export default function Inverstor() {
  return (
    <div className="investors" id="investor-roadmap">
      <h1>INVESTORS ROADMAP</h1>
      <h2>A. Investment Registration Certificate</h2>
      <p>To establish any industries in the GSEZ, first of all, any unit investors shall apply for
        commitment for allotment of land to the GSEZ Developer where they would like to invest.
        After obtaining a letter of commitment for allotment of land issued by GSEZA, all unit
        investors shall complete investment registration through GSEZA One-Stop Shop Center
        (OSSC). For investment registration, SEZ unit investors have to fill in the below fields
        (mandatory fields) of the online application form (FORM-IC- 01):
      </p>
      <ul>
        <li>Authorized Applicant’s Information</li>
        <li>Investment Plan</li>
        <li>Area of Land to be Allotted</li>
        <li>Proposed Production Plan</li>
        <li>Manpower Requirement</li>
      </ul>
      <p>Any investors that need to apply at GSEZ have to fill in the above-stated fields (mandatory
        fields) for the application for investment registration.
        After receiving the investment registration certificate issued by GSEZA with the registration
        number and date, any unit investors may go to the next steps such as the certificate of
        incorporation issued by the Ministry of Trade and Regional Integration/Regional States Trade
        Bureau, Trade License issued, and Income Tax/VAT Registration Certificates issued by
        Oromia Regional State Revenues Bureau (ORRB) OSSC of GSEZ branch office accordingly.</p>
      <h2>B. Procedure for Investment Clearance Certificate</h2>
      <p>
        Then, they may apply for investment clearance through GSEZA OSSC. For an investment
        clearance certificate, investors have to fill in all the fields of the online application form
        (FORM-IR-01). If the submitted documents are in the right order, GSEZA starts the assessment
        of the proposed investment proposal. After confirming its conformity with the proposed
        investment proposal GSEZA issues the Investment Clearance Certificate and provides it to
        the investor through GSEZA OSSC.
        The Investment Clearance Certificate is issued to the Investor after the Approval of the EIA
        Report issued by the Oromia Environmental Protection Authority (OEPA).
        It may be mentioned here that the formal land lease agreement for allotment of land shall be
        executed by the investor and the GSEZ before the issuance of the Investment Clearance
        Certificate by GSEZA.
      </p>
      <img src={InvestorRoadmap} alt="Investor Roadmap" />
    </div>
  )
}