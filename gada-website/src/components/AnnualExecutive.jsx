import '../AnnualExecutive.css';

function AnnualExecutive() {
  return (
    <div className="annual-executive">
      <h1>ANNUAL EXECUTIVE</h1>
      <div className="annual-executive-table-container">
        <table className="annual-executive-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Milestone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Land Acquisition/Transfer</td>
              <td>
                <ul>
                  <li>I. 142 ha new land shall be acquired; 500 ha land shall be transferred to investors</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>Basic Infrastructure</td>
              <td>
                <ul>
                  <li>II. All ongoing infrastructure projects shall be completed</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>Investment</td>
              <td>
                <ul>
                  <li>III. Construction of facilities for Mojo FTZ/LFTZ and others shall commence</li>
                  <li>16 new potential investors shall commence investment in GSEZ</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>Internal revenue schemes</td>
              <td>
                <ul>
                  <li>IV. ETB 0.54 billion shall be generated internally</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnnualExecutive;