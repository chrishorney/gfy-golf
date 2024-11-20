import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import SignupForm from './SignupForm';
import WeeklyList from './WeeklyList';
import YearlyStats from './YearlyStats';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function App() {
  useEffect(() => {
    const getMessage = async () => {
      try {
        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: 'your-vapid-key'
        });
        console.log('Your FCM Token:', token);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    
    getMessage();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/weekly" element={<WeeklyList />} />
        <Route path="/stats" element={<YearlyStats />} />
      </Routes>
    </Router>
  );
}

export default App;