import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';
import WeatherWidget from './components/WeatherWidget';
import { requestNotificationPermission } from './firebase-config';

function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handicap: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTrW-39fe11vjvS0gfYqSHc8i49P3DlSRDxfdr4af6kxblVMM02vQcC25vF-miCu2Z/exec';

  const handleNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        console.log('Notifications not supported');
        alert('This browser does not support notifications');
        return;
      }
      
      console.log('Requesting notification permission...');
      const token = await requestNotificationPermission();
      console.log('Received token:', token);
      
      if (token) {
        console.log('Notification permission granted');
        alert('Notifications enabled successfully!');
      } else {
        console.log('Notification permission denied or error occurred');
        alert('Please allow notifications to receive updates.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Error enabling notifications. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting form submission...');
    setSubmitStatus('submitting');

    try {
      // Create form data
      const formDataObj = new FormData();
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('handicap', formData.handicap);

      // Create a hidden form and submit it
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SCRIPT_URL;
      form.target = '_blank'; // This prevents page reload

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Add to document, submit, and remove
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // Assume success if no error thrown
      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', handicap: '' });
      
      // Navigate after delay
      setTimeout(() => {
        navigate('/weekly');
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
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
    <div>
      <WeatherWidget />
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
            {submitStatus === 'submitting' ? 'Submitting...' : "I'm in!"}
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

          <button 
            type="button"
            className="notification-button"
            onClick={handleNotificationPermission}
          >
            Enable Notifications
          </button>

          {submitStatus === 'success' && (
            <p className="success-message">Successfully signed up!</p>
          )}
          {submitStatus === 'error' && (
            <p className="error-message">Error submitting form. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default SignupForm;