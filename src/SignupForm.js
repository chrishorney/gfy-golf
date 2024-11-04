import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';

function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handicap: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIXhiCkl65f8QABCZlpHd_npczLStihpBm_2Vhky_D6YKaog-VY700I21_2Iz4j2nb/exec';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      const url = new URL(SCRIPT_URL);
      // Add action parameter to specify we're adding a player
      url.searchParams.append('action', 'addPlayer');
      Object.keys(formData).forEach(key => {
        url.searchParams.append(key, formData[key]);
      });

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors'
      });

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', handicap: '' });

      setTimeout(() => {
        navigate('/weekly');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    }
  };

  const handleViewList = () => {
    navigate('/weekly');
  };

  const handleYearlyStats = () => {
    navigate('/stats');
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Golf Group Signup</h2>
        
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="handicap">Handicap</label>
          <input
            type="number"
            id="handicap"
            name="handicap"
            value={formData.handicap}
            onChange={handleChange}
            min="0"
            max="54"
            step="0.1"
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? 'Submitting...' : 'Sign Up'}
        </button>

        <button 
          type="button" 
          className="view-list-button"
          onClick={handleViewList}
        >
          View Weekly List
        </button>

        <button 
          type="button" 
          className="yearly-stats-button"
          onClick={handleYearlyStats}
        >
          Yearly Stats
        </button>

        {submitStatus === 'success' && (
          <p className="success-message">Successfully signed up!</p>
        )}
        {submitStatus === 'error' && (
          <p className="error-message">Error submitting form. Please try again.</p>
        )}
      </form>
    </div>
  );
}

export default SignupForm;