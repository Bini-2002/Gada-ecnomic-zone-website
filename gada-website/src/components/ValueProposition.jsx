import valueProposition from '../images/value-proposition.jpg';
import '../valueproposition.css';

export default function ValueProposition() {
  return (
    <div className="value-propostions">
      <h1>VALUE PROPOSTIONS</h1>
      <div className="value-proposition-image">
        <img src={valueProposition} alt="Value Proposition" />
      </div>
      <p>
        Special Economic Zones (SEZs), such as the Gada Special Economic Zone (GSEZ),
        are territorially designated areas within a country where distinct economic
        regulations are applied to stimulate investment, boost exports, generate employment,
        and drive broader economic growth. These zones offer multifaceted value propositions,
        encompassing economic, fiscal, infrastructural, and institutional advantages tailored
        to enhance competitiveness and development. GSEZ is dedicated to the following value propositions.
      </p>
    </div>
  )
}