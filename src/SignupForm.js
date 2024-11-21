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

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwP2zYpmpp5eUagltf4B1hDgGKf7BJQC8_pw8B89QupFz7ng3ss5IWqUaT5hH5pfSxM/exec';

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
      const url = new URL(SCRIPT_URL);
      // Add action parameter to specify we're adding a player
      url.searchParams.append('action', 'addPlayer');
      Object.keys(formData).forEach(key => {
        url.searchParams.append(key, formData[key]);
      });

      // First, get the current signup count
      const countUrl = new URL(SCRIPT_URL);
      countUrl.searchParams.append('action', 'getPlayerCount');
      const countResponse = await fetch(countUrl);
      const playerCount = await countResponse.json();

      // Submit the form
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors'
      });

      // Send notification with player count
      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      // Send notification to your Firebase function
      const notificationUrl = new URL(SCRIPT_URL);
      notificationUrl.searchParams.append('action', 'sendNotification');
      notificationUrl.searchParams.append('title', `GFY Golf Update - ${formattedDate}`);
      notificationUrl.searchParams.append('body', `${playerCount + 1} ${playerCount + 1 === 1 ? 'player has' : 'players have'} signed up for golf!`);
      
      await fetch(notificationUrl, {
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