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

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyMX1uaq8YSXlYzxkp53qGC9-EBuk3e3rZjlrHLNDRsPOZzzqim406tEgQ87iAQeTdN/exec';

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
    setSubmitStatus('submitting');

    try {
      // First, check player count using JSONP
      const playerCountPromise = new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Date.now();
        const script = document.createElement('script');
        
        window[callbackName] = (response) => {
          delete window[callbackName];
          document.body.removeChild(script);
          resolve(response);
        };

        script.onerror = () => {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error('Failed to get player count'));
        };

        script.src = `${SCRIPT_URL}?action=getPlayerCount&callback=${callbackName}`;
        document.body.appendChild(script);
      });

      const countResponse = await playerCountPromise;
      
      if (countResponse.count >= 40) {
        setSubmitStatus('error');
        alert('Sorry, the maximum number of players (40) has been reached.');
        return;
      }

      // Submit the form using JSONP
      const submitPromise = new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Date.now();
        const script = document.createElement('script');
        
        window[callbackName] = (response) => {
          delete window[callbackName];
          document.body.removeChild(script);
          resolve(response);
        };

        script.onerror = () => {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error('Failed to submit form'));
        };

        const queryParams = new URLSearchParams({
          action: 'addPlayer',
          callback: callbackName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          handicap: formData.handicap
        }).toString();

        script.src = `${SCRIPT_URL}?${queryParams}`;
        document.body.appendChild(script);
      });

      const response = await submitPromise;

      if (response.status === 'success') {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', handicap: '' });

        // Send notification
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });

        setTimeout(() => {
          navigate('/weekly');
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to submit form');
      }

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