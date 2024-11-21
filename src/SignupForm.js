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

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9yhSch8hj4BFG2Ff9pL5EzN0g_YILa3gHQd3LP6XstLu-fsXH3HZPFQszVWwpLVs2/exec';

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
      // Create the URL with parameters
      const url = new URL(SCRIPT_URL);
      url.searchParams.append('action', 'addPlayer');
      url.searchParams.append('callback', 'callback_' + Date.now());
      url.searchParams.append('firstName', formData.firstName);
      url.searchParams.append('lastName', formData.lastName);
      url.searchParams.append('handicap', formData.handicap);

      console.log('Submitting to URL:', url.toString());

      // Create a promise to handle the JSONP response
      const submitPromise = new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now();
        const script = document.createElement('script');
        
        // Set up the callback function
        window[callbackName] = (response) => {
          console.log('Received response:', response);
          document.body.removeChild(script);
          delete window[callbackName];
          if (response.status === 'success') {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Submission failed'));
          }
        };

        // Handle script errors
        script.onerror = () => {
          document.body.removeChild(script);
          delete window[callbackName];
          reject(new Error('Failed to submit form'));
        };

        // Set the script source and append to document
        script.src = url.toString();
        document.body.appendChild(script);
      });

      // Wait for the response
      const response = await submitPromise;
      console.log('Submission successful:', response);

      // Handle successful submission
      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', handicap: '' });

      // Navigate after a delay
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