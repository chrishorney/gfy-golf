import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YearlyStats.css';

function YearlyStats() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Tableau script
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    scriptElement.async = true;
    document.body.appendChild(scriptElement);

    // Initialize Tableau viz
    const initTableau = () => {
      const divElement = document.getElementById('viz1730555629429');
      if (divElement) {
        const vizElement = divElement.getElementsByTagName('object')[0];
        if (divElement.offsetWidth > 800) {
          vizElement.style.width = '100%';
          vizElement.style.height = (divElement.offsetWidth * 0.75) + 'px';
        } else if (divElement.offsetWidth > 500) {
          vizElement.style.width = '100%';
          vizElement.style.height = (divElement.offsetWidth * 0.75) + 'px';
        } else {
          vizElement.style.width = '100%';
          vizElement.style.height = '1077px';
        }
      }
    };

    // Run initialization after script loads
    scriptElement.onload = initTableau;

    // Cleanup
    return () => {
      document.body.removeChild(scriptElement);
    };
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="stats-container">
      <div className="header-section">
        <h2>Yearly Statistics</h2>
        <button 
          onClick={handleBack}
          className="back-button"
        >
          Back to Signup
        </button>
      </div>
      <div className="tableau-container">
        <div className='tableauPlaceholder' id='viz1730555629429' style={{position: 'relative'}}>
          <noscript>
            <a href='#'>
              <img 
                alt='Dashboard 1' 
                src='https://public.tableau.com/static/images/Da/Dashboard_17044839326570/Dashboard1/1_rss.png' 
                style={{border: 'none'}} 
              />
            </a>
          </noscript>
          <object className='tableauViz' style={{display: 'none'}}>
            <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
            <param name='embed_code_version' value='3' />
            <param name='site_root' value='' />
            <param name='name' value='Dashboard_17044839326570/Dashboard1' />
            <param name='tabs' value='no' />
            <param name='toolbar' value='yes' />
            <param name='static_image' value='https://public.tableau.com/static/images/Da/Dashboard_17044839326570/Dashboard1/1.png' />
            <param name='animate_transition' value='yes' />
            <param name='display_static_image' value='yes' />
            <param name='display_spinner' value='yes' />
            <param name='display_overlay' value='yes' />
            <param name='display_count' value='yes' />
            <param name='language' value='en-US' />
            <param name='filter' value='publish=yes' />
          </object>
        </div>
      </div>
    </div>
  );
}

export default YearlyStats;