import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import
import './SignupForm.css';

function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handicap: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();  // Add this line

  // Replace with your actual Google Apps Script URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOHUfMQr_hpi9TLq3Wi4MBnSJ9w0Yr6LYFM41pQPFS5jy-Qm0f5pSr1gZXqq-7hMTJ/exec';

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
      Object.keys(formData).forEach(key => {
        url.searchParams.append(key, formData[key]);
      });

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors'
      });

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', handicap: '' });

      // Add navigation after successful submission
      setTimeout(() => {
        navigate('/weekly');
      }, 1500); // Wait 1.5 seconds before redirecting

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    }
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