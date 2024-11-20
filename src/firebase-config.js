import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCSYN4H4HWlLtb490kwN1xOO1kHJ9HEfAA",
  authDomain: "gfy-golf-223c9.firebaseapp.com",
  projectId: "gfy-golf-223c9",
  storageBucket: "gfy-golf-223c9.firebasestorage.app",
  messagingSenderId: "370898390679",
  appId: "1:370898390679:web:bf518b583384e5c46023d2"
};

let app;
let messaging = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Only initialize messaging if we're in a browser environment
  if (typeof window !== 'undefined' && 'Notification' in window) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log('Messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      console.log('Notification Token:', token);
      return token;
    }
  } catch (err) {
    console.error('Notification permission error:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } else {
      resolve(null);
    }
  });

export default app;