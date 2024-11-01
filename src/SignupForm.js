import React, { useState } from 'react';
import './SignupForm.css';

function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handicap: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUpTTbPH5BzgUm3eVTzf9Ji0cIrxK4kXWuRT8gnqUb8pJqE55RQIJFCHT16f2E5TKZ/exec'; // Your deployed web app URL

  const validateForm = () => {
    const newErrors = {};
    
    // Validate firstName
    if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate lastName
    if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate handicap
    const handicapNum = parseFloat(formData.handicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      newErrors.handicap = 'Handicap must be between 0 and 54';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setSubmitStatus('submitting');

    try {
      const url = new URL(SCRIPT_URL);
      Object.keys(formData).forEach(key => {
        url.searchParams.append(key, formData[key]);
      });

      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors'
      });

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', handicap: '' });
      setErrors({});

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
            className={errors.firstName ? 'error' : ''}
            required
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? 'error' : ''}
            required
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="handicap">Handicap</label>
          <input
            type="number"
            id="handicap"
            name="handicap"
            value={formData.handicap}
            onChange={handleChange}
            className={errors.handicap ? 'error' : ''}
            min="0"
            max="54"
            step="0.1"
            required
          />
          {errors.handicap && <span className="error-text">{errors.handicap}</span>}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? (
            <span className="spinner">
              <span className="spinner-inner"></span>
            </span>
          ) : (
            'Sign Up'
          )}
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