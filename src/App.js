import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import SignupForm from './SignupForm';
import WeeklyList from './WeeklyList';
import YearlyStats from './YearlyStats';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSYN4H4HWlLtb490kwN1xOO1kHJ9HEfAA",
  authDomain: "gfy-golf-223c9.firebaseapp.com",
  projectId: "gfy-golf-223c9",
  storageBucket: "gfy-golf-223c9.firebasestorage.app",
  messagingSenderId: "370898390679",
  appId: "1:370898390679:web:bf518b583384e5c46023d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function App() {
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        console.log('Initializing messaging...');
        const messaging = getMessaging(app);
        console.log('Requesting permission...');
        
        const permission = await Notification.requestPermission();
        console.log('Permission:', permission);
        
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BPQEZxGlQ9S4JaeZn_KLGQPzxT4hKr6_h0lmvBYxPMalWxdtaMoaaxWmyXHrXdxFG7FmR9oOd_7wRkF2O1THkQY'
          });
          console.log('FCM Token:', token);
        }
      } catch (error) {
        console.error('Error initializing messaging:', error);
      }
    };

    initializeMessaging();
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