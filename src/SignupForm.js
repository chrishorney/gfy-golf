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
      // First check player count using JSONP
      const getPlayerCount = () => {
        return new Promise((resolve, reject) => {
          const callbackName = 'playerCount_' + Date.now();
          window[callbackName] = (response) => {
            document.body.removeChild(script);
            delete window[callbackName];
            resolve(response);
          };

          const script = document.createElement('script');
          script.src = `${SCRIPT_URL}?action=getPlayerCount&callback=${callbackName}`;
          script.onerror = () => {
            document.body.removeChild(script);
            delete window[callbackName];
            reject(new Error('Failed to get player count'));
          };
          document.body.appendChild(script);
        });
      };

      // Check player count
      const countResponse = await getPlayerCount();
      console.log('Player count response:', countResponse);

      if (countResponse.count >= 40) {
        setSubmitStatus('error');
        alert('Sorry, the maximum number of players (40) has been reached.');
        return;
      }

      // Submit the form using JSONP
      const submitForm = () => {
        return new Promise((resolve, reject) => {
          const callbackName = 'formSubmit_' + Date.now();
          window[callbackName] = (response) => {
            document.body.removeChild(script);
            delete window[callbackName];
            resolve(response);
          };

          const script = document.createElement('script');
          script.src = `${SCRIPT_URL}?action=addPlayer&callback=${callbackName}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&handicap=${encodeURIComponent(formData.handicap)}`;
          script.onerror = () => {
            document.body.removeChild(script);
            delete window[callbackName];
            reject(new Error('Failed to submit form'));
          };
          document.body.appendChild(script);
        });
      };

      // Submit form
      const response = await submitForm();
      console.log('Form submission response:', response);

      if (response.status === 'success') {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', handicap: '' });
        setTimeout(() => {
          navigate('/weekly');
        }, 1500);
      } else {
        throw new Error(response.message || 'Form submission failed');
      }

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