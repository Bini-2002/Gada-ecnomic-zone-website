import DirectivesImg from '../images/proclamation.png';
import directiveFile from '../Files/FOREIGN-EXCHANGE-Directive-FXD-01-2024_compressed.pdf'
import '../Directives.css';

function Directives() {
  return (
    <div className="directives">
      <h1>DIRECTIVES</h1>
      <div className="directives-image">
        <img src={DirectivesImg} alt="Directives" />
        <p>FX Directive FXD 01 2024</p>
      </div>
      <h2>Foreign Exchange Freedom for Investors in Ethiopia</h2>
      <p>
        The <strong>Foreign Exchange Directive FXD/01/2024</strong> empowers foreign and domestic investors
        with clearer, more predictable rules for currency use, trade, and capital
        management—ensuring smoother operations and international competitiveness.</p>
      <h3>Key Highlights for Investors and Businesses:</h3>
      <ul>
        <li>
          <strong>Liberalized Foreign Exchange Market</strong>
          Investors can transact foreign exchange at freely negotiated market rates.
          Banks and authorized dealers report exchange activity daily,
          and the National Bank of Ethiopia (NBE) publishes
          a market-based <strong>Indicative Exchange Rate</strong> for reference.
        </li>
        <li>
          <strong>Foreign Currency Retention Rights</strong>
          Exporters may retain <strong>50% of their forex earnings</strong> in
          retention accounts for up to 30 days for their own operational use
          (e.g., imports, debt service, dividend payments).
          The other 50% must be converted into local currency at market rates.</li>
        <li> <strong>Unrestricted Repatriation for FDI</strong>
          Foreign investors may <strong>repatriate profits, dividends, capital gains,
            liquidation proceeds, and share transfers,</strong> subject to documented approval
          from the NBE. This ensures full capital mobility and protection.</li>
        <li><strong>Forex Accounts for Foreign Entities</strong>
          FDI companies, embassies, international organizations,
          and NGOs may open foreign currency accounts in Ethiopia.
          These can be used freely for all authorized foreign payments without additional permits.</li>
        <li>
          <strong>Remittance and Card Payment Modernization</strong>
          Licensed providers can offer <strong>international remittance services</strong>
          through banks, telecoms, and other channels. International credit/debit card
          use and online payments are now more accessible for tourists and e-commerce.</li>
        <li>Travel and Trade Allowances
          Travelers are eligible for prepaid forex cards and cash notes.
          Businesses such as hotels, airlines, and duty-free shops
          may <strong>accept and retain foreign currency</strong>, subject to licensing and reporting requirements.</li>
      </ul>

      <a href={directiveFile} download className="directive-download-btn">
        <button type="button">Download</button>
      </a>
    </div>
  )
}

export default Directives;
